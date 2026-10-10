package __PACKAGE__

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

/** SystemUI owns the clock: no background JS loop, foreground service or wake lock. */
object PomodogCountdown {
  private const val CHANNEL = "pomodog-timer"
  private const val TAG = "pomodog-countdown"
  private const val ID = 1
  private const val MODE = "pomodog.mode"

  private fun manager(context: Context) = context.getSystemService(NotificationManager::class.java)
  private fun current(context: Context) = manager(context).activeNotifications
    .firstOrNull { it.tag == TAG && it.id == ID }?.notification

  @Synchronized fun show(context: Context, deadlineValue: Double, mode: String) {
    require(deadlineValue.isFinite() && (mode == "focus" || mode == "break")) {
      "Invalid session countdown"
    }
    val now = System.currentTimeMillis()
    if (deadlineValue <= now) {
      hide(context)
      return
    }
    require(deadlineValue - now <= 7_200_000) { "Session countdown exceeds two hours" }
    val deadline = deadlineValue.toLong()
    val notifications = manager(context)
    if (!notifications.areNotificationsEnabled()) {
      hide(context)
      throw SecurityException("Notification permission denied")
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      notifications.createNotificationChannel(NotificationChannel(
        CHANNEL, "Timer em andamento", NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Tempo restante de foco ou descanso"
        setSound(null, null)
        enableVibration(false)
        setShowBadge(false)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      })
      if (notifications.getNotificationChannel(CHANNEL)?.importance == NotificationManager.IMPORTANCE_NONE) {
        hide(context)
        return
      }
    }
    val existing = current(context)
    if (existing?.`when` == deadline && existing.extras.getString(MODE) == mode) return
    hide(context)
    val launch = requireNotNull(context.packageManager.getLaunchIntentForPackage(context.packageName))
      .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    val openApp = PendingIntent.getActivity(
      context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    @Suppress("DEPRECATION")
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
      Notification.Builder(context, CHANNEL) else Notification.Builder(context)
    builder
      .setSmallIcon(R.drawable.pomodog_timer_notification)
      .setContentTitle(if (mode == "focus") "Foco em andamento" else "Descanso em andamento")
      .setContentText("Toque para voltar ao Pomodog.")
      .setContentIntent(openApp)
      .setWhen(deadline)
      .setShowWhen(true)
      .setUsesChronometer(true)
      .setChronometerCountDown(true)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setAutoCancel(false)
      .setCategory(Notification.CATEGORY_PROGRESS)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .addExtras(Bundle().apply { putString(MODE, mode) })
    // Recalculate after native setup so timeout never extends the session deadline.
    val remaining = deadline - System.currentTimeMillis()
    if (remaining <= 0) return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) builder.setTimeoutAfter(remaining)
    else {
      @Suppress("DEPRECATION")
      builder.setPriority(Notification.PRIORITY_LOW)
      builder.setSound(null).setVibrate(null)
      context.getSystemService(AlarmManager::class.java).setAndAllowWhileIdle(
        AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime() + remaining,
        expiryIntent(context, deadline, PendingIntent.FLAG_UPDATE_CURRENT)!!
      )
    }
    notifications.notify(TAG, ID, builder.build())
  }

  @Synchronized fun hide(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      current(context)?.let { notification ->
        expiryIntent(context, notification.`when`, PendingIntent.FLAG_NO_CREATE)?.let {
          context.getSystemService(AlarmManager::class.java).cancel(it)
          it.cancel()
        }
      }
    }
    manager(context).cancel(TAG, ID)
  }

  @Synchronized fun expire(context: Context, deadline: Long) {
    // A late expiry from a previous session must never remove a resumed timer.
    if (current(context)?.`when` == deadline && deadline <= System.currentTimeMillis()) hide(context)
  }

  private fun expiryIntent(context: Context, deadline: Long, flags: Int): PendingIntent? {
    val intent = Intent(context, PomodogCountdownExpiryReceiver::class.java)
      .setData(Uri.parse("pomodog://countdown/$deadline"))
      .putExtra("deadline", deadline)
    return PendingIntent.getBroadcast(context, 0, intent, flags or PendingIntent.FLAG_IMMUTABLE)
  }
}

class PomodogCountdownExpiryReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    PomodogCountdown.expire(context, intent.getLongExtra("deadline", -1))
  }
}

class PomodogCountdownPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
    listOf(PomodogCountdownModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class PomodogCountdownModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "PomodogCountdown"

  @ReactMethod fun show(deadline: Double, mode: String, promise: Promise) {
    try {
      PomodogCountdown.show(context, deadline, mode)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("COUNTDOWN_SHOW", "Unable to display session countdown", error)
    }
  }

  @ReactMethod fun hide(promise: Promise) {
    try {
      PomodogCountdown.hide(context)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("COUNTDOWN_HIDE", "Unable to remove session countdown", error)
    }
  }
}
