package __PACKAGE__

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class PomodogReportingPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(PomodogReportingModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class PomodogReportingModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "PomodogReporting"

  @ReactMethod fun readUsageConsent(promise: Promise) {
    promise.resolve(if (PomodogNativeReporting.usageEnabled(context)) "enabled" else "disabled")
  }

  @ReactMethod fun writeUsageConsent(value: String, promise: Promise) {
    try {
      PomodogNativeReporting.saveUsage(context, value == "enabled")
      promise.resolve(null)
    } catch (_: Exception) {
      promise.reject("USAGE_CONSENT", "Unable to update usage consent")
    }
  }

  @ReactMethod fun readConsent(promise: Promise) {
    promise.resolve(if (PomodogNativeReporting.enabled(context)) "enabled" else "disabled")
  }

  @ReactMethod fun writeConsent(value: String, promise: Promise) {
    try {
      PomodogNativeReporting.setEnabled(context, value == "enabled")
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("REPORTING_CONSENT", "Unable to update diagnostic consent")
    }
  }
}
