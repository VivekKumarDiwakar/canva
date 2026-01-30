console.log("Client app initialized.");

// 1. User ID Generation
function getUserId() {
  let id = localStorage.getItem("canvas_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("canvas_user_id", id);
  }
  return id;
}
window.myUserId = getUserId();

// 2. Ghost Cursor Logic
const cursors = {}; // Store cursor HTML elements by User ID

// Function to update/create a cursor for a specific user
window.updateCursor = function (userId, x, y) {
  // Don't show our own cursor
  if (userId === window.myUserId) return;

  // If cursor doesn't exist, create it
  if (!cursors[userId]) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";

    // Optional: Add a label with the user ID
    const label = document.createElement("div");
    label.className = "cursor-label";
    label.innerText = userId.substr(0, 5); // Show first 5 chars
    cursor.appendChild(label);

    document.body.appendChild(cursor);
    cursors[userId] = cursor;
  }

  // Update position
  const cursor = cursors[userId];
  cursor.style.left = x * window.innerWidth + "px";
  cursor.style.top = y * window.innerHeight + "px";
};

// Remove cursor if user disconnects (Optional enhancement)
window.removeCursor = function (userId) {
  if (cursors[userId]) {
    cursors[userId].remove();
    delete cursors[userId];
  }
};
