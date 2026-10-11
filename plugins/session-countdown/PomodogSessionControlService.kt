package __PACKAGE__

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class PomodogSessionControlReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val request = PomodogCountdown.request(context, intent.getStringExtra("token"), intent.getStringExtra("kind")) ?: return
    try {
      // Notification interaction temporarily permits this short background service.
      context.startService(Intent(context, PomodogSessionControlService::class.java).putExtras(request))
      HeadlessJsTaskService.acquireWakeLockNow(context)
    } catch (error: Exception) {
      Log.w("Pomodog notifications", "Unable to start session control", error)
    }
  }
}

class PomodogSessionControlService : HeadlessJsTaskService() {
  private val handler = Handler(Looper.getMainLooper())
  private val stopIfStalled = Runnable { stopSelf() }

  override fun onCreate() {
    super.onCreate()
    // Bound cold-start failures too, before RN's task timeout begins.
    handler.postDelayed(stopIfStalled, 60_000)
  }

  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val data = intent?.extras
    val token = data?.getString("token")
    val owner = data?.getString("owner")
    if (data == null || token == null || owner == null || !PomodogCountdown.isCurrent(this, token, owner)) {
      stopSelf()
      return null
    }
    return HeadlessJsTaskConfig("PomodogSessionControl", Arguments.fromBundle(data), 30_000, true)
  }

  override fun onDestroy() {
    handler.removeCallbacks(stopIfStalled)
    super.onDestroy()
  }
}
