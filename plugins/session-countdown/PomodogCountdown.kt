package __PACKAGE__

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
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
import java.util.Locale
import java.util.UUID
import kotlin.math.ceil

/** SystemUI owns the clock; JavaScript runs briefly only when a control is pressed. */
object PomodogCountdown {
  private const val CHANNEL = "pomodog-timer"
  private const val TAG = "pomodog-countdown"
  private const val ID = 1
  private const val MODE = "pomodog.mode"
  private const val STATUS = "pomodog.status"
  private const val REMAINING = "pomodog.remaining"
  private const val TOKEN = "pomodog.token"

  private fun manager(context: Context) = context.getSystemService(NotificationManager::class.java)
  private fun current(context: Context) = manager(context).activeNotifications
    .firstOrNull { it.tag == TAG && it.id == ID }?.notification
  private fun controls(context: Context) =
    context.getSharedPreferences("pomodog-countdown-control", Context.MODE_PRIVATE)

  @Synchronized fun show(context: Context, deadlineValue: Double, mode: String, owner: String) {
    require(deadlineValue.isFinite()) { "Invalid session deadline" }
    val remaining = (deadlineValue - System.currentTimeMillis()) / 1000
    if (remaining <= 0) {
      hide(context)
      return
    }
    require(remaining <= 7200) { "Session countdown exceeds two hours" }
    post(context, mode, owner, deadlineValue.toLong(), remaining)
  }

  @Synchronized fun showPaused(context: Context, remaining: Double, mode: String, owner: String) {
    require(remaining.isFinite() && remaining > 0 && remaining <= 7200) { "Invalid paused session" }
    post(context, mode, owner, 0, remaining)
  }

  private fun post(context: Context, mode: String, owner: String, deadline: Long, remaining: Double) {
    require((mode == "focus" || mode == "break") && owner.isNotEmpty() && owner.length <= 132 && !owner.contains('/')) {
      "Invalid session countdown"
    }
    val running = deadline > 0
    val status = if (running) "running" else "paused"
    val notifications = manager(context)
    if (!notifications.areNotificationsEnabled()) {
      hide(context)
      throw SecurityException("Notification permission denied")
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      notifications.createNotificationChannel(NotificationChannel(CHANNEL, "Timer em andamento", NotificationManager.IMPORTANCE_LOW).apply {
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
    if (existing?.`when` == deadline && existing.extras.getString(MODE) == mode &&
        existing.extras.getString(STATUS) == status && controls(context).getString("owner", null) == owner &&
        (running || existing.extras.getDouble(REMAINING) == remaining)) return
    hide(context)
    val token = UUID.randomUUID().toString()
    val launch = requireNotNull(context.packageManager.getLaunchIntentForPackage(context.packageName))
      .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    val openApp = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val kind = if (running) "pause" else "resume"
    val actionIntent = PendingIntent.getBroadcast(context, 0,
      Intent(context, PomodogSessionControlReceiver::class.java)
        .setData(Uri.parse("pomodog://session-control/$token"))
        .putExtra("token", token).putExtra("kind", kind),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val actionIcon = if (running) R.drawable.pomodog_pause_notification else R.drawable.pomodog_resume_notification
    @Suppress("DEPRECATION")
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, CHANNEL)
    } else {
      Notification.Builder(context)
    }
    val seconds = ceil(remaining).toLong()
    val subject = if (mode == "focus") "Foco" else "Descanso"
    val state = if (running) "em andamento" else "pausado"
    val time = String.format(Locale.ROOT, "%02d:%02d", seconds / 60, seconds % 60)
    val action = Notification.Action.Builder(
      Icon.createWithResource(context, actionIcon),
      if (running) "Pausar" else "Retomar",
      actionIntent,
    ).build()
    builder
      .setSmallIcon(R.drawable.pomodog_timer_notification)
      .setContentTitle("$subject $state")
      .setContentText(if (running) "Toque para voltar ao Pomodog." else "Tempo restante: $time")
      .setContentIntent(openApp)
      .setWhen(deadline)
      .setShowWhen(running)
      .setUsesChronometer(running)
      .setChronometerCountDown(running)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setAutoCancel(false)
      .setCategory(Notification.CATEGORY_PROGRESS)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .addAction(action)
      .addExtras(Bundle().apply {
        putString(MODE, mode)
        putString(STATUS, status)
        putString(TOKEN, token)
        putDouble(REMAINING, remaining)
      })
    if (running) {
      val millis = deadline - System.currentTimeMillis()
      if (millis <= 0) return
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) builder.setTimeoutAfter(millis)
      else context.getSystemService(AlarmManager::class.java).setAndAllowWhileIdle(
        AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime() + millis,
        expiryIntent(context, deadline, PendingIntent.FLAG_UPDATE_CURRENT)!!)
    }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      @Suppress("DEPRECATION")
      builder.setPriority(Notification.PRIORITY_LOW)
      builder.setSound(null).setVibrate(null)
    }
    // Keep account scope private to the application, outside notification extras.
    check(controls(context).edit().putString("owner", owner).putString("token", token).commit()) {
      "Unable to persist session control scope"
    }
    notifications.notify(TAG, ID, builder.build())
  }

  @Synchronized fun isCurrent(context: Context, token: String, owner: String): Boolean =
    current(context)?.extras?.getString(TOKEN) == token && controls(context).getString("token", null) == token &&
      controls(context).getString("owner", null) == owner && manager(context).areNotificationsEnabled()

  @Synchronized fun request(context: Context, token: String?, kind: String?): Bundle? {
    val notification = current(context) ?: return null
    val owner = controls(context).getString("owner", null) ?: return null
    if (token == null || !isCurrent(context, token, owner)) return null
    val running = notification.extras.getString(STATUS) == "running"
    if (kind != (if (running) "pause" else "resume")) return null
    val now = System.currentTimeMillis()
    if (running && notification.`when` <= now) return null
    return Bundle().apply {
      putString("token", token)
      putString("owner", owner)
      putString("kind", kind)
      putString("mode", notification.extras.getString(MODE))
      putDouble("deadline", if (running) notification.`when`.toDouble() else 0.0)
      putDouble("remaining", notification.extras.getDouble(REMAINING))
      putDouble("at", now.toDouble())
    }
  }

  @Synchronized fun hide(context: Context) {
    val notification = current(context)
    notification?.actions?.forEach { it.actionIntent?.cancel() }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O && notification?.`when` != null && notification.`when` > 0) {
      expiryIntent(context, notification.`when`, PendingIntent.FLAG_NO_CREATE)?.let {
        context.getSystemService(AlarmManager::class.java).cancel(it)
        it.cancel()
      }
    }
    manager(context).cancel(TAG, ID)
    check(controls(context).edit().clear().commit()) { "Unable to clear session controls" }
  }

  @Synchronized fun expire(context: Context, deadline: Long) {
    if (deadline > 0 && current(context)?.`when` == deadline && deadline <= System.currentTimeMillis()) hide(context)
  }

  private fun expiryIntent(context: Context, deadline: Long, flags: Int): PendingIntent? = PendingIntent.getBroadcast(context, 0,
    Intent(context, PomodogCountdownExpiryReceiver::class.java).setData(Uri.parse("pomodog://countdown/$deadline")).putExtra("deadline", deadline),
    flags or PendingIntent.FLAG_IMMUTABLE)
}

class PomodogCountdownExpiryReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    PomodogCountdown.expire(context, intent.getLongExtra("deadline", -1))
  }
}

class PomodogCountdownPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(PomodogCountdownModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class PomodogCountdownModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "PomodogCountdown"
  @ReactMethod fun show(deadline: Double, mode: String, owner: String, promise: Promise) =
    operation(promise) { PomodogCountdown.show(context, deadline, mode, owner) }

  @ReactMethod fun showPaused(remaining: Double, mode: String, owner: String, promise: Promise) =
    operation(promise) { PomodogCountdown.showPaused(context, remaining, mode, owner) }

  @ReactMethod fun hide(promise: Promise) =
    operation(promise) { PomodogCountdown.hide(context) }

  @ReactMethod fun isCurrent(token: String, owner: String, promise: Promise) {
    promise.resolve(PomodogCountdown.isCurrent(context, token, owner))
  }

  private fun operation(promise: Promise, work: () -> Unit) {
    try {
      work()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("COUNTDOWN", "Unable to update session notification", error)
    }
  }
}
