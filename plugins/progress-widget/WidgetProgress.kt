package __PACKAGE__

import java.util.Calendar
import java.util.TimeZone
import kotlin.math.floor

data class WidgetFocus(val endedAt: Double, val seconds: Double)
data class WidgetProgress(val streak: Int, val todayCount: Int, val todayMinutes: Int, val weekMinutes: Int)

// Calendar days (rather than 24-hour subtraction) preserve the app's local
// streak/yesterday grace across month/year boundaries and daylight saving time.
fun summarizeWidgetProgress(
  sessions: List<WidgetFocus>,
  now: Long,
  zone: TimeZone = TimeZone.getDefault(),
): WidgetProgress {
  fun calendar(time: Long) = Calendar.getInstance(zone).apply { timeInMillis = time }
  fun key(date: Calendar) = "${date.get(Calendar.YEAR)}-${date.get(Calendar.MONTH)}-${date.get(Calendar.DAY_OF_MONTH)}"
  val today = calendar(now)
  val todayKey = key(today)
  val week = (0..6).map { offset ->
    key((today.clone() as Calendar).apply { add(Calendar.DATE, -offset) })
  }.toSet()
  val completed = sessions.filter {
    it.endedAt.isFinite() && it.endedAt >= 0 && it.endedAt <= now &&
      it.seconds.isFinite() && it.seconds > 0 && it.seconds <= 7200
  }.takeLast(1000)
  val byDate = completed.groupBy { key(calendar(it.endedAt.toLong())) }
  val cursor = (today.clone() as Calendar).apply { set(Calendar.HOUR_OF_DAY, 12) }
  if (!byDate.containsKey(todayKey)) cursor.add(Calendar.DATE, -1)
  var streak = 0
  while (byDate.containsKey(key(cursor))) {
    streak++
    cursor.add(Calendar.DATE, -1)
  }
  fun minutes(values: List<WidgetFocus>) = floor(values.sumOf { it.seconds } / 60 + 0.5).toInt()
  val todaySessions = byDate[todayKey].orEmpty()
  return WidgetProgress(streak, todaySessions.size, minutes(todaySessions),
    minutes(byDate.filterKeys { it in week }.values.flatten()))
}
