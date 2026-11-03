package com.ecajasso.writeless.overlay

import android.content.Intent
import android.net.Uri
import android.provider.Settings
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
      WritelessOverlayService.isActive
    }

    Function("openPermissionSettings") {
      val context = appContext.reactContext ?: return@Function null
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("start") { labels: Map<String, String> ->
      val context = appContext.reactContext ?: return@Function null
      if (!Settings.canDrawOverlays(context)) {
        throw IllegalStateException("Overlay permission has not been granted.")
      }
      val intent = Intent(context, WritelessOverlayService::class.java).apply {
        action = WritelessOverlayService.ACTION_START
        putExtra(WritelessOverlayService.EXTRA_OPEN_APP, labels["openApp"] ?: "Open app")
        putExtra(WritelessOverlayService.EXTRA_MINIMIZE, labels["minimize"] ?: "Minimize")
        putExtra(WritelessOverlayService.EXTRA_CLOSE, labels["close"] ?: "Close")
        putExtra(WritelessOverlayService.EXTRA_EMPTY, labels["empty"] ?: "No saved messages")
        putExtra(WritelessOverlayService.EXTRA_COPIED, labels["copied"] ?: "Message copied")
        putExtra(WritelessOverlayService.EXTRA_COPIED_AND_MINIMIZED, labels["copiedAndMinimized"] ?: "Copied · panel minimized")
        putExtra(WritelessOverlayService.EXTRA_SEARCH_HINT, labels["searchHint"] ?: "Search messages")
        putExtra(WritelessOverlayService.EXTRA_NO_MATCHES, labels["noMatches"] ?: "No matching messages")
      }
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    Function("stop") {
      val context = appContext.reactContext ?: return@Function null
      context.stopService(Intent(context, WritelessOverlayService::class.java))
    }
  }
}
