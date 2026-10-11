package __PACKAGE__

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class PomodogProgressPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(ProgressModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class ProgressModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "PomodogProgressWidget"
  private fun operation(promise: Promise, action: () -> Any?) {
    try { promise.resolve(action()) }
    catch (error: Exception) { promise.reject("E_PROGRESS_WIDGET", "Unable to update progress widget", error) }
  }
  @ReactMethod fun begin(owner: String, promise: Promise) = operation(promise) { ProgressWidgetState.begin(context, owner) }
  @ReactMethod fun update(token: String, payload: String, promise: Promise) = operation(promise) {
    ProgressWidgetState.update(context, token, payload); null
  }
  @ReactMethod fun updateForOwner(owner: String, payload: String, promise: Promise) = operation(promise) {
    ProgressWidgetState.updateForOwner(context, owner, payload); null
  }
  @ReactMethod fun end(token: String, promise: Promise) = operation(promise) { ProgressWidgetState.end(context, token); null }
  @ReactMethod fun clear(promise: Promise) = operation(promise) { ProgressWidgetState.clear(context); null }
}
