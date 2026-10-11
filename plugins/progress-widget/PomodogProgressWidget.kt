package __PACKAGE__

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.RemoteViews
import org.json.JSONArray
import java.util.Calendar
import java.util.UUID

class PomodogProgressWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    ProgressWidgetState.refresh(context)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
    ProgressWidgetState.refresh(context)
  }

  override fun onDisabled(context: Context) { ProgressWidgetState.cancelRefresh(context) }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action in listOf(ProgressWidgetState.REFRESH, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED))
      ProgressWidgetState.refresh(context)
  }
}

object ProgressWidgetState {
  const val REFRESH = "__PACKAGE__.PROGRESS_WIDGET_REFRESH"
  private const val STORE = "pomodog-progress-widget"
  private fun store(context: Context) = context.getSharedPreferences(STORE, Context.MODE_PRIVATE)

  @Synchronized fun begin(context: Context, owner: String): String {
    require(owner == "guest" || (owner.startsWith("uid:") && owner.length in 5..132))
    val token = UUID.randomUUID().toString()
    check(store(context).edit().clear().putString("owner", owner).putString("token", token).commit())
    refresh(context)
    return token
  }

  @Synchronized fun update(context: Context, token: String, payload: String) {
    if (store(context).getString("token", null) != token) return
    write(context, payload)
  }

  @Synchronized fun updateForOwner(context: Context, owner: String, payload: String) {
    if (store(context).getString("owner", null) != owner) return
    write(context, payload)
  }

  @Synchronized fun end(context: Context, token: String) {
    if (store(context).getString("token", null) == token) clear(context)
  }

  @Synchronized fun clear(context: Context) {
    check(store(context).edit().clear().commit())
    refresh(context)
  }

  private fun write(context: Context, payload: String) {
    // Validate the complete bounded snapshot before replacing a known good one.
    decode(payload)
    check(store(context).edit().putString("sessions", payload).commit())
    refresh(context)
  }

  private fun decode(payload: String): List<WidgetFocus> {
    require(payload.length <= 100_000)
    val array = JSONArray(payload)
    require(array.length() <= 1001)
    return (0 until array.length()).map { index ->
      val pair = array.getJSONArray(index)
      require(pair.length() == 2)
      val endedAt = pair.getDouble(0)
      val seconds = pair.getDouble(1)
      require(endedAt.isFinite() && endedAt in 0.0..8_640_000_000_000_000.0)
      require(seconds.isFinite() && seconds > 0 && seconds <= 7200)
      WidgetFocus(endedAt, seconds)
    }
  }

  @Synchronized fun refresh(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val ids = manager.getAppWidgetIds(ComponentName(context, PomodogProgressWidget::class.java))
    if (ids.isEmpty()) { cancelRefresh(context); return }
    val payload = store(context).getString("sessions", null)
    val sessions = payload?.let { runCatching { decode(it) }.getOrNull() }
    val now = System.currentTimeMillis()
    val progress = summarizeWidgetProgress(sessions.orEmpty(), now)
    val views = RemoteViews(context.packageName, R.layout.pomodog_progress_widget)
    val streakLabel = context.getString(
      if (progress.streak == 1) R.string.widget_streak_day else R.string.widget_streak_days)
    val todayLabel = context.getString(R.string.widget_today, progress.todayMinutes,
      context.getString(if (progress.todayCount == 1) R.string.widget_session else R.string.widget_sessions, progress.todayCount))
    views.setTextViewText(R.id.widget_streak, progress.streak.toString())
    views.setTextViewText(R.id.widget_streak_label, streakLabel)
    views.setTextViewText(R.id.widget_today, todayLabel)
    views.setTextViewText(R.id.widget_week, if (sessions == null) context.getString(R.string.widget_open)
      else context.getString(R.string.widget_week, progress.weekMinutes))
    views.setContentDescription(R.id.widget_root, context.getString(R.string.widget_accessibility,
      progress.streak, streakLabel.replace('\n', ' '), todayLabel, progress.weekMinutes))
    val launch = Intent(context, MainActivity::class.java).apply {
      action = Intent.ACTION_MAIN
      addCategory(Intent.CATEGORY_LAUNCHER)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
    }
    views.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(context, 7201, launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
    manager.updateAppWidget(ids, views)
    // One inexact, non-wakeup refresh at the next calendar boundary or focus
    // deadline. The OS may defer it; no polling, exact-alarm permission or JS boot.
    val midnight = Calendar.getInstance().apply {
      add(Calendar.DATE, 1)
      set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis
    val nextFocus = sessions.orEmpty().filter { it.endedAt > now }.minOfOrNull { it.endedAt.toLong() }
    val next = minOf(midnight, nextFocus ?: midnight)
    context.getSystemService(AlarmManager::class.java).set(AlarmManager.RTC, next, refreshIntent(context))
  }

  private fun refreshIntent(context: Context) = PendingIntent.getBroadcast(context, 7202,
    Intent(context, PomodogProgressWidget::class.java).setAction(REFRESH),
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

  fun cancelRefresh(context: Context) {
    context.getSystemService(AlarmManager::class.java).cancel(refreshIntent(context))
  }
}
