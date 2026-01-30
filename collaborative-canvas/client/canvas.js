const canvas = document.getElementById("drawing-board");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("color-picker");

let drawing = false;
let current = { x: 0, y: 0 };

// 1. Resize Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 2. Draw Line Function
window.drawLine = function (x0, y0, x1, y1, color, emit) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.closePath();

  if (!emit) return;

  if (window.socket) {
    const w = canvas.width;
    const h = canvas.height;

    window.socket.emit("draw", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      userId: window.myUserId, // <--- SENDING THE PERSISTENT ID
    });
  }
};

// 3. Mouse Events
function onMouseDown(e) {
  drawing = true;
  current.x = e.clientX;
  current.y = e.clientY;
}

function onMouseUp(e) {
  if (!drawing) return;
  drawing = false;
  window.drawLine(
    current.x,
    current.y,
    e.clientX,
    e.clientY,
    colorPicker.value,
    true,
  );
}

function onMouseMove(e) {
  if (!drawing) return;
  window.drawLine(
    current.x,
    current.y,
    e.clientX,
    e.clientY,
    colorPicker.value,
    true,
  );
  current.x = e.clientX;
  current.y = e.clientY;

  if (drawing) {
    window.drawLine(
      current.x,
      current.y,
      e.clientX,
      e.clientY,
      colorPicker.value,
      true,
    );
    current.x = e.clientX;
    current.y = e.clientY;
  }

  // 2. NEW: Emit Ghost Cursor Movement
  // We throttle this using the existing throttle wrapper
  if (window.socket) {
    window.socket.emit("cursor", {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
      userId: window.myUserId,
    });
  }
}

function throttle(callback, delay) {
  let previousCall = new Date().getTime();
  return function () {
    const time = new Date().getTime();
    if (time - previousCall >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

// 4. Undo / Clear Logic (Updated)
const undoBtn = document.getElementById("undo-btn");
const clearBtn = document.getElementById("clear-btn");

if (undoBtn) {
  undoBtn.addEventListener("click", () => {
    if (window.socket) {
      // Tell the server WHICH user wants to undo
      window.socket.emit("undo", window.myUserId);
    }
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (window.socket) window.socket.emit("clear");
  });
}

window.redrawCanvas = function (history) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width;
  const h = canvas.height;

  history.forEach((stroke) => {
    window.drawLine(
      stroke.x0 * w,
      stroke.y0 * h,
      stroke.x1 * w,
      stroke.y1 * h,
      stroke.color,
      false,
    );
  });
};
