package __PACKAGE__

import io.sentry.Breadcrumb
import io.sentry.SentryEvent
import io.sentry.protocol.SentryException
import io.sentry.protocol.SentryStackFrame
import io.sentry.protocol.SentryStackTrace
import io.sentry.protocol.User
import org.junit.Assert.*
import org.junit.Test

class NativeReportingTest {
  @Test fun legacyAndMalformedConsentsDoNotAuthorizeNativeCollection() {
    assertTrue(PomodogNativeReporting.currentConsent("__CONSENT_VERSION__".toByteArray()))
    assertFalse(PomodogNativeReporting.currentConsent(byteArrayOf(1)))
    assertFalse(PomodogNativeReporting.currentConsent(byteArrayOf(0)))
    assertFalse(PomodogNativeReporting.currentConsent(byteArrayOf()))
    assertFalse(PomodogNativeReporting.currentConsent("outdated".toByteArray()))
  }

  @Test fun sensitivePayloadIsRemovedAndCrashLocationSurvives() {
    val frame = SentryStackFrame().apply {
      filename = "/private/Profile.kt?token=secret"
      absPath = "/private/Profile.kt"
      function = "save"
      lineno = 42
      vars = mapOf("token" to "secret")
      contextLine = "private data"
    }
    val event = SentryEvent().apply {
      release = "pomodog@0.1.0"
      user = User().apply { email = "private@example.com" }
      setExtra("history", "private")
      setTag("uid", "private")
      addBreadcrumb(Breadcrumb().apply { message = "private" })
      contexts["account"] = "private"
      exceptions = listOf(SentryException().apply {
        type = "IllegalStateException"
        value = "private@example.com secret"
        stacktrace = SentryStackTrace(listOf(frame))
      })
    }
    val clean = requireNotNull(PomodogNativeReporting.sanitize(event))
    assertEquals(event.eventId, clean.eventId)
    assertEquals("pomodog@0.1.0", clean.release)
    assertEquals("0.0.0.0", clean.user?.ipAddress)
    assertNull(clean.user?.email)
    assertTrue(clean.extras.isNullOrEmpty())
    assertTrue(clean.contexts.isEmpty())
    assertTrue(clean.breadcrumbs.isNullOrEmpty())
    assertEquals(mapOf("operation" to "native.crash"), clean.tags)
    val exception = clean.exceptions!!.single()
    assertEquals("Native application crash (message omitted for privacy)", exception.value)
    assertEquals(false, exception.mechanism?.isHandled)
    assertTrue(clean.isCrashed)
    val cleanedFrame = exception.stacktrace!!.frames!!.single()
    assertEquals("Profile.kt", cleanedFrame.filename)
    assertEquals(42, cleanedFrame.lineno)
    assertNull(cleanedFrame.absPath)
    assertNull(cleanedFrame.vars)
    assertNull(cleanedFrame.contextLine)
  }

  @Test fun arbitraryMessagesWithoutExceptionsAreDropped() {
    assertNull(PomodogNativeReporting.sanitize(SentryEvent()))
  }
}
