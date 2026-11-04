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
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.text.Editable
import android.text.TextWatcher
import java.io.File
import kotlin.math.abs

class WritelessOverlayService : Service() {
  companion object {
    const val ACTION_START = "com.ecajasso.writeless.overlay.START"
    const val EXTRA_OPEN_APP = "open_app"
    const val EXTRA_MINIMIZE = "minimize"
    const val EXTRA_CLOSE = "close"
    const val EXTRA_EMPTY = "empty"
    const val EXTRA_COPIED = "copied"
    const val EXTRA_COPIED_AND_MINIMIZED = "copied_and_minimized"
    const val EXTRA_SEARCH_HINT = "search_hint"
    const val EXTRA_NO_MATCHES = "no_matches"
    private const val CHANNEL_ID = "writeless_overlay"
    private const val NOTIFICATION_ID = 5801
    private const val DATABASE_NAME = "writeless.db"
    private const val PANEL_MESSAGES_HEIGHT_DP = 252 // 30% shorter than the original 360dp list area
    @Volatile var isActive = false
      private set
  }

  private lateinit var windowManager: WindowManager
  private var bubble: View? = null
  private var panel: View? = null
  private var bubbleParams: WindowManager.LayoutParams? = null
  private var panelParams: WindowManager.LayoutParams? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  private var copyFeedbackView: View? = null
  private var copyFeedbackRemoval: Runnable? = null
  private var openAppLabel = "Open app"
  private var minimizeLabel = "Minimize"
  private var closeLabel = "Close"
  private var emptyLabel = "No saved messages"
  private var copiedLabel = "Message copied"
  private var copiedAndMinimizedLabel = "Copied · panel minimized"
  private var searchHint = "Search messages"
  private var noMatchesLabel = "No matching messages"
  private var positionX = 0
  private var positionY = 220

  override fun onCreate() {
    super.onCreate()
    isActive = true
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_START) {
      openAppLabel = intent.getStringExtra(EXTRA_OPEN_APP) ?: openAppLabel
      minimizeLabel = intent.getStringExtra(EXTRA_MINIMIZE) ?: minimizeLabel
      closeLabel = intent.getStringExtra(EXTRA_CLOSE) ?: closeLabel
      emptyLabel = intent.getStringExtra(EXTRA_EMPTY) ?: emptyLabel
      copiedLabel = intent.getStringExtra(EXTRA_COPIED) ?: copiedLabel
      copiedAndMinimizedLabel = intent.getStringExtra(EXTRA_COPIED_AND_MINIMIZED) ?: copiedAndMinimizedLabel
      searchHint = intent.getStringExtra(EXTRA_SEARCH_HINT) ?: searchHint
      noMatchesLabel = intent.getStringExtra(EXTRA_NO_MATCHES) ?: noMatchesLabel
      startAsForegroundService()
      if (bubble == null && panel == null) showBubble()
    }
    return START_NOT_STICKY
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
      overlayWindowType(),
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

    val searchInput = EditText(this).apply {
      hint = searchHint
      textSize = 13f
      setSingleLine(true)
      setTextColor(Color.rgb(45, 49, 57))
      setHintTextColor(Color.rgb(135, 140, 149))
      setPadding(dp(10), 0, dp(10), 0)
      background = rounded(Color.rgb(242, 244, 247), dp(9).toFloat())
      imeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH
    }
    container.addView(searchInput, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(38)).apply { bottomMargin = dp(8) })

    val scroll = ScrollView(this).apply { isFillViewport = true }
    val messages = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
    val rows = readMessages()
    fun renderMessages(query: String) {
      messages.removeAllViews()
      val matchingRows = rows.filter { it.first.contains(query, ignoreCase = true) || it.second.contains(query, ignoreCase = true) }
      if (matchingRows.isEmpty()) {
        messages.addView(TextView(this).apply {
          text = if (rows.isEmpty()) emptyLabel else noMatchesLabel
          textSize = 13f
          setTextColor(Color.rgb(120, 125, 134))
          setPadding(dp(2), dp(14), 0, dp(14))
        })
      }
      matchingRows.forEach { message ->
        val row = LinearLayout(this).apply {
          orientation = LinearLayout.VERTICAL
          setPadding(dp(10), dp(10), dp(10), dp(10))
          background = rounded(Color.rgb(240, 242, 246), dp(12).toFloat())
          setOnClickListener { copyMessage(message.second) }
          setOnLongClickListener {
            copyMessage(message.second, copiedAndMinimizedLabel)
            minimize()
            true
          }
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
          maxLines = 1
          ellipsize = android.text.TextUtils.TruncateAt.END
          setPadding(0, dp(4), 0, 0)
        })
        val rowParams = LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.MATCH_PARENT,
          LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { bottomMargin = dp(8) }
        messages.addView(row, rowParams)
      }
    }
    renderMessages("")
    searchInput.addTextChangedListener(object : TextWatcher {
      override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
      override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = renderMessages(s?.toString().orEmpty().trim())
      override fun afterTextChanged(s: Editable?) = Unit
    })
    scroll.addView(messages)
    container.addView(
      scroll,
      LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(PANEL_MESSAGES_HEIGHT_DP))
    )

    val width = minOf(dp(340), resources.displayMetrics.widthPixels - dp(24))
    val params = WindowManager.LayoutParams(
      width,
      WindowManager.LayoutParams.WRAP_CONTENT,
      overlayWindowType(),
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
      PixelFormat.TRANSLUCENT
    ).apply {
      softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
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

  private fun copyMessage(content: String, feedback: String = copiedLabel) {
    val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("Writeless message", content))
    showCopyFeedback(feedback)
  }

  private fun showCopyFeedback(message: String) {
    removeCopyFeedback()

    val feedback = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      setPadding(dp(16), dp(11), dp(16), dp(11))
      background = rounded(Color.rgb(35, 39, 48), dp(24).toFloat())
      elevation = dp(10).toFloat()
      alpha = 0f
      translationY = -dp(6).toFloat()
      contentDescription = message
      importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_YES
    }

    feedback.addView(TextView(this).apply {
      text = "✓"
      textSize = 15f
      typeface = Typeface.DEFAULT_BOLD
      setTextColor(Color.rgb(143, 220, 165))
      setPadding(0, 0, dp(8), 0)
    })

    feedback.addView(TextView(this).apply {
      text = message
      textSize = 13f
      typeface = Typeface.DEFAULT_MEDIUM
      setTextColor(Color.WHITE)
      maxLines = 1
    })

    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      overlayWindowType(),
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
      val panelTop = panelParams?.y ?: dp(88)
      y = (panelTop - dp(58)).coerceAtLeast(dp(24))
    }

    try {
      windowManager.addView(feedback, params)
      copyFeedbackView = feedback
      feedback.animate()
        .alpha(1f)
        .translationY(0f)
        .setDuration(160)
        .start()

      val removal = Runnable {
        feedback.animate()
          .alpha(0f)
          .translationY(-dp(6).toFloat())
          .setDuration(140)
          .withEndAction { removeCopyFeedback(feedback) }
          .start()
      }
      copyFeedbackRemoval = removal
      mainHandler.postDelayed(removal, 1_500L)
    } catch (_: Exception) {
      copyFeedbackView = null
    }
  }

  private fun removeCopyFeedback(expectedView: View? = null) {
    copyFeedbackRemoval?.let(mainHandler::removeCallbacks)
    copyFeedbackRemoval = null
    val current = copyFeedbackView ?: return
    if (expectedView != null && current !== expectedView) return
    try { windowManager.removeView(current) } catch (_: Exception) {}
    copyFeedbackView = null
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
    minimize()
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

  private fun overlayWindowType(): Int =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
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
    isActive = false
    removeBubble()
    removePanel()
    removeCopyFeedback()
    stopForeground(STOP_FOREGROUND_REMOVE)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null
}
