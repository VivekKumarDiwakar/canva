window.socket = io();

// 1. Receive Live Draws (Single strokes)
window.socket.on("draw", (data) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  window.drawLine(
    data.x0 * w,
    data.y0 * h,
    data.x1 * w,
    data.y1 * h,
    data.color,
    false,
  );
});

// 2. Receive Full History (On Join or Undo)
window.socket.on("history", (history) => {
  // This triggers a full wipe and redraw
  if (window.redrawCanvas) {
    window.redrawCanvas(history);
  }
});

window.socket.on("connect_error", (err) => {
  console.error("Connection failed:", err);
});
// Listen for Cursor Movements
window.socket.on('cursor', (data) => {
    if (window.updateCursor) {
        window.updateCursor(data.userId, data.x, data.y);
    }
});