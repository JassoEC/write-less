package com.ecajasso.writeless.overlay

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WritelessOverlayModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WritelessOverlay")

    Function("hasPermission") {
      val context = appContext.reactContext ?: return@Function false
      Settings.canDrawOverlays(context)
    }

    Function("isRunning") {
      val context = appContext.reactContext ?: return@Function false
      context.getSharedPreferences("writeless_overlay", 0)
        .getBoolean("running", false)
    }

    Function("openPermissionSettings") {
      val context = appContext.reactContext ?: return@Function
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("start") { labels: Map<String, String> ->
      val context = appContext.reactContext ?: return@Function
      if (!Settings.canDrawOverlays(context)) {
        throw IllegalStateException("Overlay permission has not been granted.")
      }
      val intent = Intent(context, WritelessOverlayService::class.java).apply {
        action = WritelessOverlayService.ACTION_START
        putExtra(WritelessOverlayService.EXTRA_OPEN_APP, labels["openApp"] ?: "Open app")
        putExtra(WritelessOverlayService.EXTRA_MINIMIZE, labels["minimize"] ?: "Minimize")
        putExtra(WritelessOverlayService.EXTRA_CLOSE, labels["close"] ?: "Close")
        putExtra(WritelessOverlayService.EXTRA_EMPTY, labels["empty"] ?: "No saved messages")
      }
      ContextCompat.startForegroundService(context, intent)
    }

    Function("stop") {
      val context = appContext.reactContext ?: return@Function
      context.stopService(Intent(context, WritelessOverlayService::class.java))
    }
  }
}
