// --- 1. CLOCK FUNCTIONALITY ---
function updateTime() {
  const timeDiv = document.getElementById("clock"); // UPDATED: Targets new ID
  if (!timeDiv) return;

  const now = new Date();
  // Format to match the image: HH:MM (24-hour format)
  const formattedTime = now.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    // Uncomment the next line if you really want seconds back:
    // second: "2-digit"
  });
  timeDiv.textContent = formattedTime;
}

// --- 2. WEEKLY SCHEDULE FUNCTIONALITY ---
function updateCurrentDay() {
  const now = new Date();
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  const currentDayIndex = now.getDay();

  // Define the styles for Active vs Inactive states
  // Note: We preserve the 'width: 100%' for Sunday (day-0) inside the loop
  const baseStyle =
    "border-radius: 12px; padding: 14px 0; font-size: 0.85rem; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.2s ease;";
  const activeColors =
    "background: #fafafa; color: #09090b; box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); border: 1px solid white;";
  const inactiveColors =
    "background: #27272a; color: #a1a1aa; border: 1px solid transparent;";

  // Loop through all 7 days (0 = Sun, 1 = Mon, ... 6 = Sat)
  for (let i = 0; i <= 6; i++) {
    const dayEl = document.getElementById(`day-${i}`);
    if (dayEl) {
      let finalStyle = baseStyle;

      // Apply colors
      if (i === currentDayIndex) {
        finalStyle += activeColors;
      } else {
        finalStyle += inactiveColors;
      }

      // Preserve Sunday's full width
      if (i === 0) {
        finalStyle += " width: 100%;";
      }

      dayEl.style.cssText = finalStyle;

      // Re-attach the click listener for To-Dos
      // Passing 'i' creates a unique todo list for "Monday", "Tuesday", etc.
      dayEl.onclick = () => handleDayClick(i);

      // Optional: Show a tiny dot if tasks exist for this day
      const count = getTodoCountSimple(i);
      if (count > 0 && i !== currentDayIndex) {
        dayEl.innerHTML = `${getDayName(
          i
        )} <span style="font-size:8px; vertical-align: top; color: #3b82f6;">●</span>`;
      } else {
        dayEl.innerText = getDayName(i);
      }
    }
  }
}

function getDayName(index) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[index];
}

function getTodoCountSimple(dayIndex) {
  const todos = JSON.parse(localStorage.getItem(`todo_week_${dayIndex}`)) || [];
  return todos.length;
}

// --- 3. TO-DO LOGIC (Updated for Weekly Keys) ---

function handleDayClick(dayIndex) {
  const modal = document.getElementById("todoModal");
  const todoListContainer = document.getElementById("todoList");
  const todoTitleInput = document.getElementById("todoTitleInput");
  const todoDescInput = document.getElementById("todoDescInput");
  const saveButton = document.getElementById("saveTodo");

  // Update modal title
  const dayName = getDayName(dayIndex);
  document.querySelector("#todoModal h2").innerText = `${dayName}'s Tasks`;

  // Use a unique key for weekly todos: 'todo_week_0', 'todo_week_1', etc.
  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Render List
  renderTodoList(todoList, todoListContainer, dayIndex);

  // Save Button Logic
  saveButton.onclick = () => {
    const newTitle = todoTitleInput.value.trim();
    const newDesc = todoDescInput.value.trim();
    if (newTitle && newDesc) {
      const newTodo = { title: newTitle, description: newDesc };
      todoList.push(newTodo);
      localStorage.setItem(storageKey, JSON.stringify(todoList));

      renderTodoList(todoList, todoListContainer, dayIndex);
      updateCurrentDay(); // Update dots on main screen

      todoTitleInput.value = "";
      todoDescInput.value = "";
    }
  };

  modal.style.display = "block";
}

function renderTodoList(list, container, dayIndex) {
  container.innerHTML = list
    .map(
      (item, index) => `
      <div class="todo-item" draggable="true" ondragstart="drag(event)" id="todo_${dayIndex}_${index}">
        <div class="content">
          <h3 ondblclick="editTodoItem(${dayIndex}, ${index}, 'title')">${item.title}</h3>
        </div>
        <div class="actions">
          <button class="delete" onclick="deleteTodoItem(${dayIndex}, ${index}, event)">Delete</button>
          <button class="view" onclick="viewTodoDetails(${dayIndex}, ${index}, event)">View</button>
        </div>
      </div>
    `
    )
    .join("");
}

function deleteTodoItem(dayIndex, itemIndex, event) {
  event.stopPropagation();
  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  todoList.splice(itemIndex, 1);
  localStorage.setItem(storageKey, JSON.stringify(todoList));

  // Re-render
  const todoListContainer = document.getElementById("todoList");
  renderTodoList(todoList, todoListContainer, dayIndex);
  updateCurrentDay();
}

function editTodoItem(dayIndex, itemIndex, field) {
  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];
  const newValue = prompt(`Edit ${field}:`, todoList[itemIndex][field]);

  if (newValue !== null) {
    todoList[itemIndex][field] = newValue.trim();
    localStorage.setItem(storageKey, JSON.stringify(todoList));

    const todoListContainer = document.getElementById("todoList");
    renderTodoList(todoList, todoListContainer, dayIndex);
  }
}

function viewTodoDetails(dayIndex, itemIndex, event) {
  event.stopPropagation();
  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  const todoDetails = document.getElementById("todoDetails");
  const todoDetailsContent = document.getElementById("todoDetailsContent");

  todoDetailsContent.innerHTML = `
      <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">${todoList[itemIndex].title}</h3>
      <textarea readonly style="width: 100%; height: 150px; background: #27272a; color: white; padding: 10px; border-radius: 8px;">${todoList[itemIndex].description}</textarea>
    `;
  todoDetails.style.display = "flex"; // Changed to flex to center it
}

// --- 4. SHORTCUTS & UTILS ---

function handleTimeClick() {
  const modal = document.getElementById("shortcutModal");
  if (!modal) {
    createShortcutModal();
  }
  displayShortcuts();
  document.getElementById("shortcutModal").style.display = "block";
}

// (Keep your existing Shortcut Modal generation code here)
// I am keeping your exact shortcut logic, just updating where they display on the main card

function updateClockAreaShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
  // UPDATED: Target the new hidden container in HTML
  let shortcutContainer = document.getElementById("clockAreaShortcuts");

  if (!shortcutContainer) return;

  if (shortcuts.length > 0) {
    shortcutContainer.style.display = "flex";
    shortcutContainer.style.gap = "10px";
    shortcutContainer.style.justifyContent = "center";
    shortcutContainer.style.marginTop = "20px";
    shortcutContainer.style.flexWrap = "wrap";

    shortcutContainer.innerHTML = shortcuts
      .map(
        (shortcut) => `
        <a href="${shortcut.url}" target="_blank" title="${shortcut.name}" 
           style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #27272a; border-radius: 50%; border: 1px solid #3f3f46; transition: transform 0.2s;">
            <img src="${getFaviconUrl(
              shortcut.url
            )}" style="width: 16px; height: 16px; border-radius: 2px;">
        </a>
      `
      )
      .join("");
  } else {
    shortcutContainer.style.display = "none";
  }
}

// --- 5. INITIALIZATION ---

// Modals closing logic
function closeModal() {
  document.getElementById("todoModal").style.display = "none";
}
function closeTodoDetails() {
  document.getElementById("todoDetails").style.display = "none";
}

window.onclick = function (event) {
  const todoModal = document.getElementById("todoModal");
  const shortcutModal = document.getElementById("shortcutModal");
  const detailsModal = document.getElementById("todoDetails");

  if (event.target == todoModal) todoModal.style.display = "none";
  if (event.target == shortcutModal) shortcutModal.style.display = "none";
  if (event.target == detailsModal) detailsModal.style.display = "none";
};

// Drag & Drop
function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}
function allowDrop(event) {
  event.preventDefault();
}
function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);
  event.target
    .closest(".todo-item")
    .insertAdjacentElement("beforebegin", draggedElement);
}

// Helper for Favicons
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch (e) {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><circle cx="12" cy="12" r="10"/></svg>';
  }
}

// Create Shortcut Modal (The one you had)
function createShortcutModal() {
  // ... (Insert your previous createShortcutModal code here if not already present in DOM) ...
  // Since you pasted it before, I assume you can paste the big block back here.
  // For brevity, I am calling the same logic.

  const modalHTML = `
    <div id="shortcutModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.8);">
      <div class="modal-content" style="background: #18181b; padding: 24px; border-radius: 16px; border: 1px solid #27272a; max-width: 500px; margin: 10% auto;">
        <h2 style="color: white; margin-bottom: 20px;">Shortcuts</h2>
        <input type="text" id="shortcutName" placeholder="Name" style="width: 100%; padding: 10px; margin-bottom: 10px; background: #27272a; border: 1px solid #3f3f46; color: white; border-radius: 8px;">
        <input type="text" id="shortcutUrl" placeholder="URL (https://...)" style="width: 100%; padding: 10px; margin-bottom: 20px; background: #27272a; border: 1px solid #3f3f46; color: white; border-radius: 8px;">
        <button onclick="addShortcut()" style="width: 100%; padding: 10px; background: white; color: black; border-radius: 8px; font-weight: bold; cursor: pointer;">Add Shortcut</button>
        <div id="shortcutList" style="margin-top: 20px; color: #a1a1aa;"></div>
        <span onclick="closeShortcutModal()" style="position: absolute; top: 20px; right: 20px; color: white; cursor: pointer; font-size: 24px;">&times;</span>
      </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Add/Delete/Display Shortcuts Logic
function addShortcut() {
  const name = document.getElementById("shortcutName").value;
  const url = document.getElementById("shortcutUrl").value;
  if (name && url) {
    const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
    shortcuts.push({ name, url });
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    displayShortcuts();
    updateClockAreaShortcuts();
    document.getElementById("shortcutName").value = "";
    document.getElementById("shortcutUrl").value = "";
  }
}

function displayShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
  document.getElementById("shortcutList").innerHTML = shortcuts
    .map(
      (s, i) => `
        <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 16px; 
            margin-bottom: 8px; 
            background: #27272a; 
            border: 1px solid #3f3f46; 
            border-radius: 8px;
            transition: background 0.2s;
        ">
            <div style="display: flex; align-items: center; gap: 10px; margin-right : 50px">
                <!-- Optional: Add favicon image if you want -->
                <img src="${getFaviconUrl(s.url)}" style="width: 16px; height: 16px; border-radius: 2px; opacity: 0.8;">
                <span style="color: #e4e4e7; font-weight: 500; font-size: 0.95rem;">${s.name}</span>
            </div>
            
            <button onclick="deleteShortcut(${i})" style="
                background: rgba(239, 68, 68, 0.1); 
                color: #ef4444; 
                border: 1px solid rgba(239, 68, 68, 0.2); 
                padding: 6px 12px; 
                border-radius: 6px; 
                font-size: 0.8rem; 
                font-weight: 600; 
                cursor: pointer; 
                transition: all 0.2s ease;
            "
            onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='scale(1.05)'"
            onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='scale(1)'"
            >
                Delete
            </button>
        </div>
    `
    )
    .join("");
}

function deleteShortcut(index) {
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
  shortcuts.splice(index, 1);
  localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
  displayShortcuts();
  updateClockAreaShortcuts();
}

// --- 6. STARTUP ---
// Runs immediately
setInterval(updateTime, 1000);

// Runs on load
window.onload = () => {
  updateTime();
  updateCurrentDay();
  updateClockAreaShortcuts();
};

// --- 7. YEAR PROGRESS (365 Days) FUNCTIONALITY ---

function updateDaysLeft() {
  const daysLeftContainer = document.getElementById("dayLeftContainer");
  if (!daysLeftContainer) return;

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const isLeapYear = (year) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
  const daysLeft = daysInYear - dayOfYear;

  // --- CSS CALC FIX ---
  // 1. 'repeat(auto-fit, ...)' fills the row.
  // 2. 'minmax(calc(100% / 25), 1fr)' ensures roughly 25 columns.
  //    If the container is wide, the boxes grow large to fill the space.
  daysLeftContainer.style.cssText = `
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(calc(100% / 28), 1fr));
    gap: 6px;
    padding: 20px; 
    width: 100%; 
    height: 100%;
    align-content: start;
    overflow-y: auto;
  `;

  // Common box style
  const boxStyle = "width: 100%; aspect-ratio: 1; border-radius: 4px; cursor: pointer; position: relative; transition: transform 0.2s;";

  daysLeftContainer.innerHTML = `
    ${Array.from(
      { length: dayOfYear },
      (_, i) => `
        <div 
            onclick="handleYearClick(${i + 1})"
            title="Day ${i + 1}"
            onmouseover="this.style.transform='scale(1.1)'" 
            onmouseout="this.style.transform='scale(1)'"
            style="
                ${boxStyle}
                background: ${i + 1 === dayOfYear ? "#fff" : "#71717a"};
                box-shadow: ${i + 1 === dayOfYear ? "0 0 15px rgba(255,255,255,0.6)" : "none"};
                z-index: ${i + 1 === dayOfYear ? "2" : "1"};
            ">
            ${getYearTodoIndicator(i + 1)}
        </div>
    `
    ).join("")}

    ${Array.from(
      { length: daysLeft },
      (_, i) => `
        <div 
            onclick="handleYearClick(${dayOfYear + i + 1})"
            title="Day ${dayOfYear + i + 1}"
            onmouseover="this.style.transform='scale(1.1)'" 
            onmouseout="this.style.transform='scale(1)'"
            style="${boxStyle} background: #27272a;">
            ${getYearTodoIndicator(dayOfYear + i + 1)}
        </div>
    `
    ).join("")}
  `;
}

// Helper to show a tiny dot if the Year Day has tasks
function getYearTodoIndicator(day) {
  const todos = JSON.parse(localStorage.getItem(`todo_day_${day}`)) || [];
  if (todos.length > 0) {
    return `<div style="position: absolute; top: -2px; right: -2px; width: 4px; height: 4px; background: #3b82f6; border-radius: 50%;"></div>`;
  }
  return "";
}

// Specific Handler for the 365-Day Grid
function handleYearClick(day) {
  const modal = document.getElementById("todoModal");
  const todoListContainer = document.getElementById("todoList");
  const saveButton = document.getElementById("saveTodo");

  // Update Title
  document.querySelector("#todoModal h2").innerText = `Day ${day} of 365`;

  // Use 'todo_day_X' key so it doesn't mix with Weekly tasks
  const storageKey = `todo_day_${day}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  renderTodoList(todoList, todoListContainer, day, "year");

  // Save Logic for Year Grid
  saveButton.onclick = () => {
    const title = document.getElementById("todoTitleInput").value.trim();
    const desc = document.getElementById("todoDescInput").value.trim();
    if (title && desc) {
      const list = JSON.parse(localStorage.getItem(storageKey)) || [];
      list.push({ title, description: desc });
      localStorage.setItem(storageKey, JSON.stringify(list));

      renderTodoList(list, todoListContainer, day, "year");
      updateDaysLeft(); // Refresh the grid dots

      document.getElementById("todoTitleInput").value = "";
      document.getElementById("todoDescInput").value = "";
    }
  };

  modal.style.display = "block";
}

// Updated Render Function to handle both Year ('year') and Week (0-6)
// You need to update your existing renderTodoList to accept the 'type' argument
function renderTodoList(list, container, index, type = "week") {
  container.innerHTML = list
    .map(
      (item, i) => `
      <div class="todo-item" id="todo_${index}_${i}">
        <div class="content">
          <h3>${item.title}</h3>
        </div>
        <div class="actions">
          <button class="delete" onclick="${
            type === "year"
              ? `deleteYearTodo(${index}, ${i})`
              : `deleteTodoItem(${index}, ${i}, event)`
          }">Del</button>
          <button class="view" onclick="${
            type === "year"
              ? `viewYearTodo(${index}, ${i})`
              : `viewTodoDetails(${index}, ${i}, event)`
          }">View</button>
        </div>
      </div>
    `
    )
    .join("");
}

// Specific Delete/View for Year Grid
function deleteYearTodo(day, itemIndex) {
  const storageKey = `todo_day_${day}`;
  const list = JSON.parse(localStorage.getItem(storageKey)) || [];
  list.splice(itemIndex, 1);
  localStorage.setItem(storageKey, JSON.stringify(list));
  renderTodoList(list, document.getElementById("todoList"), day, "year");
  updateDaysLeft();
}

function viewYearTodo(day, itemIndex) {
  const storageKey = `todo_day_${day}`;
  const list = JSON.parse(localStorage.getItem(storageKey)) || [];
  const item = list[itemIndex];
  document.getElementById(
    "todoDetailsContent"
  ).innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`;
  document.getElementById("todoDetails").style.display = "flex";
}

// Update window.onload to include the new function
const originalOnLoad = window.onload;
window.onload = () => {
  if (originalOnLoad) originalOnLoad();
  updateDaysLeft(); // Initialize the 365 grid
};
