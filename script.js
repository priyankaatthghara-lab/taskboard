alert("script.js is running");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const columns = document.querySelectorAll(".column");
const toast = document.getElementById("toast");
const toggleModeBtn = document.getElementById("toggle-mode");

let boardState = { todo: [], doing: [], done: [] };
let draggedTask = null;
let draggedFrom = null;

function showToast(msg, emoji="🔔") {
  toast.textContent = `${emoji} ${msg}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function saveBoard() {
  localStorage.setItem("taskhero-board", JSON.stringify(boardState));
}

function loadBoard() {
  const stored = localStorage.getItem("taskhero-board");
  if (stored) boardState = JSON.parse(stored);
}

function createTaskDOM(task, status, idx) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.setAttribute("draggable", "true");
  card.setAttribute("data-idx", idx);
  card.setAttribute("data-status", status);
  card.innerHTML = `
    <span>${task.text}</span>
    <div class="task-actions">
      <button class="edit-btn" title="Edit">✏️</button>
      <button class="delete-btn" title="Delete">🗑️</button>
    </div>
  `;

  card.querySelector(".edit-btn").onclick = () => {
    const newText = prompt("Edit task ✨", task.text);
    if (newText && newText.trim().length > 0) {
      boardState[status][idx].text = newText.trim();
      renderBoard();
      saveBoard();
      showToast("Task edited!", "📝");
    }
  };

  // Delete button event
  card.querySelector(".delete-btn").onclick = () => {
    boardState[status].splice(idx,1);
    renderBoard();
    saveBoard();
    showToast("Task deleted!", "🗑️");
  };

  // Drag events
  card.ondragstart = e => {
    draggedTask = task;
    draggedFrom = {status, idx};
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = "move";
  };
  card.ondragend = e => {
    draggedTask = null;
    draggedFrom = null;
    card.classList.remove('dragging');
    columns.forEach(col => col.classList.remove('over'));
  };

  return card;
}

function renderBoard() {
  ["todo","doing","done"].forEach(status => {
    const list = document.getElementById(`${status}-list`);
    list.innerHTML = "";
    boardState[status].forEach((task, idx) => {
      list.appendChild(createTaskDOM(task, status, idx));
    });
  });
}

function addTask(text) {
  if (text.trim().length == 0) {
    showToast("Task can’t be empty!", "⚠️");
    return;
  }
  boardState.todo.push({text});
  renderBoard();
  saveBoard();
  showToast("Added new task!", "🎉");
  taskInput.value = "";
}

addTaskBtn.onclick = () => addTask(taskInput.value);
taskInput.onkeydown = e => { if (e.key === "Enter") addTask(taskInput.value); };

columns.forEach(col => {
  col.ondragover = e => {
    e.preventDefault();
    col.classList.add("over");
  };
  col.ondragleave = () => col.classList.remove("over");
  col.ondrop = e => {
    col.classList.remove("over");
    if (draggedTask && draggedFrom) {
      // Only allow drops on valid columns
      const targetStatus = col.getAttribute("data-status");
      if(targetStatus === draggedFrom.status) return;
      boardState[draggedFrom.status].splice(draggedFrom.idx, 1);
      boardState[targetStatus].push(draggedTask);
      renderBoard();
      saveBoard();
      showToast(`Task moved to ${col.querySelector('.col-header').textContent}`, "🚚");
    }
  };
});

// dRK light mode togle
toggleModeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  toggleModeBtn.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
};

loadBoard();
renderBoard();
