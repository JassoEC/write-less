package com.ecajasso.writeless.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import java.io.File
import kotlin.math.abs

class WritelessOverlayService : Service() {
  companion object {
    const val ACTION_START = "com.ecajasso.writeless.overlay.START"
    const val EXTRA_OPEN_APP = "open_app"
    const val EXTRA_MINIMIZE = "minimize"
    const val EXTRA_CLOSE = "close"
    const val EXTRA_EMPTY = "empty"
    private const val CHANNEL_ID = "writeless_overlay"
    private const val NOTIFICATION_ID = 5801
    private const val DATABASE_NAME = "writeless.db"
  }

  private lateinit var windowManager: WindowManager
  private var bubble: View? = null
  private var panel: View? = null
  private var bubbleParams: WindowManager.LayoutParams? = null
  private var panelParams: WindowManager.LayoutParams? = null
  private var openAppLabel = "Open app"
  private var minimizeLabel = "Minimize"
  private var closeLabel = "Close"
  private var emptyLabel = "No saved messages"
  private var positionX = 0
  private var positionY = 220

  override fun onCreate() {
    super.onCreate()
    getSharedPreferences("writeless_overlay", MODE_PRIVATE).edit().putBoolean("running", true).apply()
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_START) {
      openAppLabel = intent.getStringExtra(EXTRA_OPEN_APP) ?: openAppLabel
      minimizeLabel = intent.getStringExtra(EXTRA_MINIMIZE) ?: minimizeLabel
      closeLabel = intent.getStringExtra(EXTRA_CLOSE) ?: closeLabel
      emptyLabel = intent.getStringExtra(EXTRA_EMPTY) ?: emptyLabel
      startAsForegroundService()
      if (bubble == null && panel == null) showBubble()
    }
    return START_STICKY
  }

  private fun startAsForegroundService() {
    val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_menu_info_details)
        .setContentTitle("Writeless is active")
        .setContentText("Your floating message panel is ready.")
        .setOngoing(true)
        .build()
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
        .setSmallIcon(android.R.drawable.ic_menu_info_details)
        .setContentTitle("Writeless is active")
        .setContentText("Your floating message panel is ready.")
        .setOngoing(true)
        .build()
    }

    if (Build.VERSION.SDK_INT >= 34) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Writeless floating panel",
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Keeps the Writeless floating message panel available."
      }
      (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
        .createNotificationChannel(channel)
    }
  }

  private fun showBubble() {
    if (!android.provider.Settings.canDrawOverlays(this) || bubble != null) return

    val size = dp(56)
    val view = TextView(this).apply {
      text = "W"
      textSize = 20f
      setTextColor(Color.WHITE)
      gravity = Gravity.CENTER
      typeface = Typeface.DEFAULT_BOLD
      background = rounded(Color.rgb(39, 73, 115), size / 2f)
      elevation = dp(8).toFloat()
      contentDescription = "Open Writeless message panel"
      setOnClickListener { showPanel() }
      setOnTouchListener(createDragListener { showPanel() })
    }

    val params = WindowManager.LayoutParams(
      size,
      size,
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = positionX.takeIf { it > 0 } ?: (resources.displayMetrics.widthPixels - size - dp(12))
      y = positionY
    }

    try {
      windowManager.addView(view, params)
      bubble = view
      bubbleParams = params
    } catch (_: Exception) {
      stopSelf()
    }
  }

  private fun showPanel() {
    if (panel != null) return
    removeBubble()

    val container = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(14), dp(12), dp(14), dp(12))
      background = rounded(Color.rgb(250, 250, 252), dp(18).toFloat())
      elevation = dp(12).toFloat()
    }

    val header = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
    }
    val title = TextView(this).apply {
      text = "Writeless"
      textSize = 17f
      setTextColor(Color.rgb(28, 31, 38))
      typeface = Typeface.DEFAULT_BOLD
    }
    header.addView(title, LinearLayout.LayoutParams(0, dp(42), 1f))
    header.addView(actionButton("↗", openAppLabel) { openMainApp() })
    header.addView(actionButton("−", minimizeLabel) { minimize() })
    header.addView(actionButton("×", closeLabel) { stopSelf() })
    header.setOnTouchListener(createDragListener())

    container.addView(header)

    val scroll = ScrollView(this).apply {
      isFillViewport = true
    }
    val messages = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
    }
    val rows = readMessages()
    if (rows.isEmpty()) {
      messages.addView(TextView(this).apply {
        text = emptyLabel
        textSize = 14f
        setTextColor(Color.DKGRAY)
        setPadding(0, dp(18), 0, dp(18))
      })
    } else {
      rows.forEach { message ->
        val row = LinearLayout(this).apply {
          orientation = LinearLayout.VERTICAL
          setPadding(dp(10), dp(10), dp(10), dp(10))
          background = rounded(Color.rgb(240, 242, 246), dp(12).toFloat())
          setOnClickListener { copyMessage(message.second) }
        }
        row.addView(TextView(this).apply {
          text = message.first
          textSize = 14f
          typeface = Typeface.DEFAULT_BOLD
          setTextColor(Color.rgb(35, 39, 48))
          maxLines = 1
        })
        row.addView(TextView(this).apply {
          text = message.second
          textSize = 12f
          setTextColor(Color.rgb(88, 94, 105))
          maxLines = 2
          setPadding(0, dp(4), 0, 0)
        })
        val rowParams = LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.MATCH_PARENT,
          LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { bottomMargin = dp(8) }
        messages.addView(row, rowParams)
      }
    }
    scroll.addView(messages)
    container.addView(
      scroll,
      LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(360))
    )

    val width = minOf(dp(340), resources.displayMetrics.widthPixels - dp(24))
    val params = WindowManager.LayoutParams(
      width,
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
      x = 0
      y = positionY.coerceAtLeast(dp(24))
    }

    try {
      windowManager.addView(container, params)
      panel = container
      panelParams = params
    } catch (_: Exception) {
      showBubble()
    }
  }

  private fun readMessages(): List<Pair<String, String>> {
    val databaseFile = File(filesDir, "SQLite/$DATABASE_NAME")
    if (!databaseFile.exists()) return emptyList()

    return try {
      val database = SQLiteDatabase.openDatabase(
        databaseFile.absolutePath,
        null,
        SQLiteDatabase.OPEN_READONLY or SQLiteDatabase.NO_LOCALIZED_COLLATORS
      )
      database.use { db ->
        db.rawQuery(
          "SELECT title, content FROM messages ORDER BY position ASC, created_at DESC LIMIT 100",
          null
        ).use { cursor ->
          buildList {
            while (cursor.moveToNext()) {
              add(cursor.getString(0).orEmpty() to cursor.getString(1).orEmpty())
            }
          }
        }
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  private fun copyMessage(content: String) {
    val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("Writeless message", content))
    Toast.makeText(this, "Copied", Toast.LENGTH_SHORT).show()
  }

  private fun actionButton(symbol: String, description: String, action: () -> Unit): TextView {
    return TextView(this).apply {
      text = symbol
      textSize = 22f
      gravity = Gravity.CENTER
      setTextColor(Color.rgb(60, 65, 75))
      contentDescription = description
      setPadding(dp(8), 0, dp(8), 0)
      setOnClickListener { action() }
    }
  }

  private fun openMainApp() {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName) ?: return
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    startActivity(launchIntent)
  }

  private fun minimize() {
    removePanel()
    showBubble()
  }

  private fun createDragListener(onClick: (() -> Unit)? = null): View.OnTouchListener {
    return object : View.OnTouchListener {
      private var downX = 0f
      private var downY = 0f
      private var startX = 0
      private var startY = 0
      private var moved = false

      override fun onTouch(view: View, event: MotionEvent): Boolean {
        val target = if (view === bubble) bubble else panel
      val params = if (view === bubble) bubbleParams else panelParams
        when (event.action) {
          MotionEvent.ACTION_DOWN -> {
            downX = event.rawX
            downY = event.rawY
            startX = params?.x ?: 0
            startY = params?.y ?: 0
            moved = false
            return true
          }
          MotionEvent.ACTION_MOVE -> {
            val dx = (event.rawX - downX).toInt()
            val dy = (event.rawY - downY).toInt()
            if (abs(dx) > dp(4) || abs(dy) > dp(4)) moved = true
            if (moved && params != null) {
              params.x = startX + dx
              params.y = (startY + dy).coerceAtLeast(dp(12))
              try { target?.let { windowManager.updateViewLayout(it, params) } } catch (_: Exception) {}
            }
            return true
          }
          MotionEvent.ACTION_UP -> {
            if (!moved) onClick?.invoke()
            if (view === bubble && params != null) {
              positionX = params.x
              positionY = params.y
            } else if (view !== bubble && params != null) {
              positionY = params.y
            }
            return true
          }
        }
        return false
      }
    }
  }

  private fun rounded(color: Int, radius: Float) = GradientDrawable().apply {
    setColor(color)
    cornerRadius = radius
  }

  private fun dp(value: Int): Int =
    (value * resources.displayMetrics.density).toInt()

  private fun removeBubble() {
    bubble?.let { try { windowManager.removeView(it) } catch (_: Exception) {} }
    bubble = null
    bubbleParams = null
  }

  private fun removePanel() {
    panel?.let { try { windowManager.removeView(it) } catch (_: Exception) {} }
    panel = null
    panelParams = null
  }

  override fun onDestroy() {
    getSharedPreferences("writeless_overlay", MODE_PRIVATE).edit().putBoolean("running", false).apply()
    removeBubble()
    removePanel()
    stopForeground(STOP_FOREGROUND_REMOVE)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null
}
