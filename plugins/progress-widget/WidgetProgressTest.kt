package __PACKAGE__

import java.util.Calendar
import java.util.TimeZone
import org.junit.Assert.*
import org.junit.Test

class WidgetProgressTest {
  private val utc = TimeZone.getTimeZone("UTC")
  private fun at(year: Int, month: Int, day: Int, zone: TimeZone = utc) = Calendar.getInstance(zone).apply {
    clear(); set(year, month - 1, day, 12, 0, 0)
  }.timeInMillis
  private fun focus(time: Long, seconds: Double = 1500.0) = WidgetFocus(time.toDouble(), seconds)

  @Test fun streakIsNotLimitedToWeekAndCrossesYearBoundary() {
    val now = at(2026, 1, 4)
    val sessions = (0..9).map { offset ->
      focus(Calendar.getInstance(utc).apply { timeInMillis = now; add(Calendar.DATE, -offset) }.timeInMillis)
    } + listOf(focus(now))
    assertEquals(WidgetProgress(10, 2, 50, 200), summarizeWidgetProgress(sessions, now, utc))
  }

  @Test fun yesterdayGraceExpiresAfterMissingFullCalendarDay() {
    val ended = at(2026, 1, 31)
    assertEquals(1, summarizeWidgetProgress(listOf(focus(ended)), at(2026, 2, 1), utc).streak)
    assertEquals(0, summarizeWidgetProgress(listOf(focus(ended)), at(2026, 2, 2), utc).streak)
    assertEquals(WidgetProgress(0, 0, 0, 0), summarizeWidgetProgress(emptyList(), ended, utc))
  }

  @Test fun futureFocusCountsOnlyAfterDeadlineAndRoundingMatchesApp() {
    val now = at(2026, 10, 11)
    val sessions = listOf(focus(now - 1000, 89.0), focus(now, 89.0), focus(now + 1000))
    assertEquals(WidgetProgress(1, 2, 3, 3), summarizeWidgetProgress(sessions, now, utc))
    assertEquals(WidgetProgress(1, 3, 28, 28), summarizeWidgetProgress(sessions, now + 1000, utc))
    val invalid = listOf(WidgetFocus(Double.NaN, 60.0), WidgetFocus(-1.0, 60.0), focus(now, 7201.0))
    assertEquals(WidgetProgress(0, 0, 0, 0), summarizeWidgetProgress(invalid, now, utc))
  }

  @Test fun localDatesAndDaylightSavingMatchCalendarHabit() {
    val zone = TimeZone.getTimeZone("America/New_York")
    val now = at(2024, 3, 11, zone)
    val sessions = (8..11).map { focus(at(2024, 3, it, zone)) }
    assertEquals(4, summarizeWidgetProgress(sessions, now, zone).streak)
    val midnightUtc = at(2026, 10, 11) - 12 * 60 * 60 * 1000
    val nearMidnight = listOf(focus(midnightUtc))
    assertEquals(1, summarizeWidgetProgress(nearMidnight, midnightUtc + 4 * 60 * 60 * 1000, utc).todayCount)
    assertEquals(0, summarizeWidgetProgress(nearMidnight, midnightUtc + 4 * 60 * 60 * 1000,
      TimeZone.getTimeZone("America/Sao_Paulo")).todayCount)
  }

  @Test fun pendingCreditDoesNotDiscardOldestCompletedFocusPrematurely() {
    val now = at(2026, 10, 11)
    val completed = List(1000) { focus(now) }
    assertEquals(1000, summarizeWidgetProgress(completed + focus(now + 1000), now, utc).todayCount)
    assertEquals(1000, summarizeWidgetProgress(completed + focus(now + 1000), now + 1000, utc).todayCount)
  }
}
