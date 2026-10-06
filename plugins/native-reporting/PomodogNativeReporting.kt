package __PACKAGE__

import android.content.Context
import android.util.AtomicFile
import com.facebook.react.common.JavascriptException
import com.google.firebase.analytics.FirebaseAnalytics
import io.sentry.Sentry
import io.sentry.SentryEvent
import io.sentry.SentryLevel
import io.sentry.UncaughtExceptionHandlerIntegration
import io.sentry.android.core.SentryAndroid
import io.sentry.protocol.User
import io.sentry.protocol.Mechanism
import io.sentry.protocol.SentryException
import io.sentry.protocol.SentryStackFrame
import io.sentry.protocol.SentryStackTrace
import java.io.File

/** Consent is native-owned so it also applies before JavaScript starts. */
object PomodogNativeReporting {
  @Volatile private var allowed = false
  private val grant = "__CONSENT_VERSION__".toByteArray(Charsets.UTF_8)

  internal fun currentConsent(bytes: ByteArray) = bytes.contentEquals(grant)
  private fun usageFile(context: Context) = AtomicFile(File(context.noBackupFilesDir, "pomodog-usage-consent"))
  fun usageEnabled(context: Context): Boolean = try {
    currentConsent(usageFile(context).readFully())
  } catch (_: Exception) { false }

  fun restoreUsage(context: Context) {
    // Runs before FirebaseInitProvider. A persisted SDK permission cannot replace
    // a grant for the current notice, including during upgrades before JS starts.
    FirebaseAnalytics.getInstance(context).setAnalyticsCollectionEnabled(usageEnabled(context))
  }

  @Synchronized fun saveUsage(context: Context, value: Boolean) {
    val file = usageFile(context)
    var stream: java.io.FileOutputStream? = null
    try {
      stream = file.startWrite()
      stream.write(if (value) grant else byteArrayOf(0))
      file.finishWrite(stream)
    } catch (error: Exception) {
      file.failWrite(stream)
      file.delete()
      FirebaseAnalytics.getInstance(context).setAnalyticsCollectionEnabled(false)
      throw IllegalStateException("Unable to save usage consent")
    }
  }

  private fun consentFile(context: Context) = AtomicFile(File(context.noBackupFilesDir, "pomodog-reporting-consent"))
  private fun savedConsent(context: Context): Boolean = try {
    currentConsent(consentFile(context).readFully())
  } catch (_: Exception) { false }
  private fun cache(context: Context) = File(context.noBackupFilesDir, "pomodog-sentry")

  @Synchronized fun restore(context: Context) {
    allowed = savedConsent(context)
    try {
      if (allowed) initialize(context) else cache(context).deleteRecursively()
    } catch (_: Exception) {
      allowed = false
      Sentry.close()
      cache(context).deleteRecursively()
    }
  }

  fun enabled(context: Context) = allowed && savedConsent(context)

  @Synchronized fun setEnabled(context: Context, value: Boolean) {
    // Block callbacks first, including when committing the preference fails.
    allowed = false
    val file = consentFile(context)
    var stream: java.io.FileOutputStream? = null
    try {
      stream = file.startWrite()
      stream.write(if (value) grant else byteArrayOf(0))
      file.finishWrite(stream)
    } catch (error: Exception) {
      file.failWrite(stream)
      file.delete()
      Sentry.close()
      cache(context).deleteRecursively()
      throw IllegalStateException("Unable to save diagnostic consent")
    }
    Sentry.close()
    if (value) {
      allowed = true
      try {
        initialize(context)
      } catch (error: Exception) {
        allowed = false
        file.delete()
        Sentry.close()
        cache(context).deleteRecursively()
        throw error
      }
    } else {
      cache(context).deleteRecursively()
    }
  }

  private fun initialize(context: Context) {
    SentryAndroid.init(context) { options ->
      options.dsn = "__DSN__"
      options.release = "pomodog@__VERSION__"
      options.environment = if (BuildConfig.DEBUG) "development" else "production"
      options.cacheDirPath = cache(context).absolutePath
      options.isSendDefaultPii = false
      options.isEnableAutoSessionTracking = false
      options.isEnableNdk = false
      options.isAnrEnabled = false
      options.isAttachScreenshot = false
      options.isAttachViewHierarchy = false
      options.isAttachThreads = false
      options.isEnableUserInteractionTracing = false
      options.tracesSampleRate = 0.0
      options.profilesSampleRate = 0.0
      options.maxBreadcrumbs = 0
      options.maxCacheItems = 10
      options.addIgnoredExceptionForType(JavascriptException::class.java)
      // Only JVM uncaught exceptions and cached envelopes; no UI/network integrations.
      options.integrations.removeAll { it !is UncaughtExceptionHandlerIntegration && it.javaClass.simpleName != "SendCachedEnvelopeIntegration" }
      options.setBeforeBreadcrumb { _, _ -> null }
      options.setBeforeSendTransaction { _, _ -> null }
      options.setBeforeSend { event, _ ->
        if (!enabled(context)) null else sanitize(event)
      }
    }
    check(Sentry.isEnabled()) { "Unable to initialize native diagnostics" }
  }

  internal fun sanitize(event: SentryEvent): SentryEvent? {
    val exceptions = event.exceptions ?: return null
    if (exceptions.isEmpty()) return null
    val sanitized = exceptions.map { exception ->
      SentryException().apply {
        type = exception.type
        module = exception.module
        threadId = exception.threadId
        value = "Native application crash (message omitted for privacy)"
        mechanism = Mechanism().apply {
          type = "UncaughtExceptionHandler"
          isHandled = false
        }
        exception.stacktrace?.frames?.let { frames ->
          stacktrace = SentryStackTrace(frames.map { frame ->
            SentryStackFrame().apply {
              filename = frame.filename?.substringAfterLast('/')?.substringAfterLast('\\')?.substringBefore('?')
              function = frame.function
              module = frame.module
              lineno = frame.lineno
              colno = frame.colno
              isInApp = frame.isInApp
            }
          })
        }
      }
    }
    // Rebuild an allowlisted event, rather than remove known sensitive fields.
    return SentryEvent().apply {
      eventId = event.eventId
      timestamp = event.timestamp
      platform = event.platform
      release = event.release
      environment = event.environment
      level = SentryLevel.FATAL
      this.exceptions = sanitized
      user = User().apply { ipAddress = "0.0.0.0" }
      setTag("operation", "native.crash")
    }
  }
}
