// ==========================================
// 0. INDEXED DB HELPERS (For Large Files)
// ==========================================
const DB_NAME = "KanishkWallpaperDB";
const STORE_NAME = "files";

// Open Database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Save Blob/File to DB
async function saveFileToDB(file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(file, "current_wallpaper");
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
}

// Get Blob/File from DB
async function getFileFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("current_wallpaper");
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (e) => reject(e);
  });
}

// Clear DB
async function clearIndexedDB() {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).clear();
}

// ==========================================
// 1. INITIALIZATION & EVENT LISTENERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Initial Renders ---
  updateTime();
  updateCurrentDay();
  updateClockAreaShortcuts();
  initWallpaper();
  updateDaysLeft();

  // Start Clock Interval
  setInterval(updateTime, 1000);

  // --- Static Event Listeners (Matching HTML IDs) ---

  // Wallpaper Modal
  bindClick("openWallBtn", openWallpaperModal);
  bindClick("closeWallModalBtn", closeWallpaperModal);
  bindClick("saveUrlBtn", saveWallpaperUrl);
  bindClick("saveFileBtn", saveWallpaperFile);
  bindClick("resetWallBtn", resetWallpaper);

  // Shortcuts
  bindClick("timeActionBtn", handleTimeClick);

  // To-Do Modal
  bindClick("closeTodoModalBtn", closeModal);
  bindClick("closeTodoDetailsBtn", closeTodoDetails);
  // Note: "saveTodo" is handled dynamically in handleDayClick

  // --- Event Delegation for Dynamic Lists ---

  // 1. Year Grid Clicks (Delegation on container)
  const dayLeftContainer = document.getElementById("dayLeftContainer");
  if (dayLeftContainer) {
    dayLeftContainer.addEventListener("click", (e) => {
      const box = e.target.closest(".year-box");
      if (box) {
        const day = parseInt(box.dataset.day);
        handleYearClick(day);
      }
    });
  }

  // 2. To-Do List Actions (Delete/View/Edit & Dragging)
  const todoListEl = document.getElementById("todoList");
  if (todoListEl) {
    // Click Handling
    todoListEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      const title = e.target.closest("h3");

      if (btn) {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        const day = parseInt(btn.dataset.day);
        const type = btn.dataset.type; // 'week' or 'year'

        if (action === "delete") {
          if (type === "year") deleteYearTodo(day, index);
          else deleteTodoItem(day, index);
        } else if (action === "view") {
          if (type === "year") viewYearTodo(day, index);
          else viewTodoDetails(day, index);
        }
      }
      
      // Double click on title to edit
      if(e.target.tagName === 'H3' && e.detail === 2) { 
          const itemDiv = e.target.closest('.todo-item');
          const index = parseInt(itemDiv.dataset.index);
          const day = parseInt(itemDiv.dataset.day);
          editTodoItem(day, index, 'title');
      }
    });

    // Drag Handling
    todoListEl.addEventListener("dragstart", drag);
    todoListEl.addEventListener("dragover", allowDrop);
    todoListEl.addEventListener("drop", drop);
  }

  // 3. Window Click (Close Modals)
  window.addEventListener("click", (event) => {
    const todoModal = document.getElementById("todoModal");
    const shortcutModal = document.getElementById("shortcutModal");
    const detailsModal = document.getElementById("todoDetails");
    const wallModal = document.getElementById("wallpaperModal");

    if (event.target === todoModal) todoModal.style.display = "none";
    if (event.target === shortcutModal) shortcutModal.style.display = "none";
    if (event.target === detailsModal) detailsModal.style.display = "none";
    if (event.target === wallModal) closeWallpaperModal();
  });
});

// Helper to safely bind clicks
function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
}

// ==========================================
// 2. WALLPAPER LOGIC
// ==========================================

function updateTime() {
  const timeDiv = document.getElementById("clock");
  if (!timeDiv) return;
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  timeDiv.textContent = formattedTime;
}

function openWallpaperModal() {
  document.getElementById("wallpaperModal").style.display = "block";
}

function closeWallpaperModal() {
  document.getElementById("wallpaperModal").style.display = "none";
  const err = document.getElementById("uploadError");
  if (err) err.style.display = "none";
}

function saveWallpaperUrl() {
  const url = document.getElementById("wallUrlInput").value.trim();
  if (!url) return;

  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
  const isVideo = videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  const type = isVideo ? "video" : "image";

  clearIndexedDB();
  const wallpaperData = { source: "url", type, url };
  localStorage.setItem("user_wallpaper_meta", JSON.stringify(wallpaperData));

  applyWallpaper(url, type);
  closeWallpaperModal();
  document.getElementById("wallUrlInput").value = "";
}

async function saveWallpaperFile() {
  const fileInput = document.getElementById("wallFileInput");
  const file = fileInput.files[0];
  if (!file) return;

  const btn = document.getElementById("saveFileBtn");
  const originalText = btn.innerText;
  btn.innerText = "Saving...";

  try {
    await saveFileToDB(file);
    const type = file.type.startsWith("video") ? "video" : "image";
    const wallpaperData = { source: "db", type: type };
    localStorage.setItem("user_wallpaper_meta", JSON.stringify(wallpaperData));

    const objectUrl = URL.createObjectURL(file);
    applyWallpaper(objectUrl, type);
    closeWallpaperModal();
  } catch (err) {
    console.error("DB Error:", err);
    alert("Failed to save large file. " + err.message);
  } finally {
    btn.innerText = originalText;
    fileInput.value = "";
  }
}

function resetWallpaper() {
  localStorage.removeItem("user_wallpaper_meta");
  clearIndexedDB();
  initWallpaper();
  closeWallpaperModal();
}

async function initWallpaper() {
  const meta = JSON.parse(localStorage.getItem("user_wallpaper_meta"));
  if (!meta) {
    applyWallpaper(
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974",
      "image"
    );
    setupDoubleClick();
    return;
  }

  if (meta.source === "url") {
    applyWallpaper(meta.url, meta.type);
  } else if (meta.source === "db") {
    try {
      const fileBlob = await getFileFromDB();
      if (fileBlob) {
        const objectUrl = URL.createObjectURL(fileBlob);
        applyWallpaper(objectUrl, meta.type);
      }
    } catch (e) {
      console.error("Could not load wallpaper from DB", e);
    }
  }
  setupDoubleClick();
}

function setupDoubleClick() {
  const container = document.getElementById("daysParent");
  if (container) {
    // We can use a simple onclick for this specific logic since it's top level
    container.ondblclick = (e) => {
      if (
        e.target === container ||
        e.target.classList.contains("dayLeftContainer") ||
        e.target.classList.contains("media-content")
      ) {
        openWallpaperModal();
      }
    };
  }
}

function applyWallpaper(url, type) {
  const imgEl = document.getElementById("wallpaperImage");
  const vidEl = document.getElementById("wallpaperVideo");

  if (type === "video") {
    imgEl.classList.add("hidden");
    vidEl.classList.remove("hidden");
    vidEl.src = url;
    vidEl.play().catch((e) => console.log("Autoplay blocked:", e));
  } else {
    vidEl.classList.add("hidden");
    vidEl.pause();
    imgEl.classList.remove("hidden");
    imgEl.src = url;
  }
}

// ==========================================
// 3. WEEKLY SCHEDULE LOGIC
// ==========================================

function updateCurrentDay() {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 = Sun

  const baseStyle =
    "border-radius: 12px; padding: 14px 0; font-size: 0.85rem; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.2s ease;";
  const activeColors =
    "background: #fafafa; color: #09090b; box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); border: 1px solid white;";
  const inactiveColors =
    "background: #27272a; color: #a1a1aa; border: 1px solid transparent;";

  for (let i = 0; i <= 6; i++) {
    const dayEl = document.getElementById(`day-${i}`);
    if (dayEl) {
      let finalStyle = baseStyle;
      if (i === currentDayIndex) finalStyle += activeColors;
      else finalStyle += inactiveColors;
      if (i === 0) finalStyle += " width: 100%;";

      dayEl.style.cssText = finalStyle;
      
      // Re-bind click using listener (safer)
      // Clone node is a quick way to wipe old listeners to prevent duplicates on re-run
      const newEl = dayEl.cloneNode(true);
      dayEl.parentNode.replaceChild(newEl, dayEl);
      newEl.addEventListener("click", () => handleDayClick(i));

      const count = getTodoCountSimple(i);
      if (count > 0 && i !== currentDayIndex) {
        newEl.innerHTML = `${getDayName(i)} <span style="font-size:8px; vertical-align: top; color: #3b82f6;">●</span>`;
      } else {
        newEl.innerText = getDayName(i);
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

function handleDayClick(dayIndex) {
  const modal = document.getElementById("todoModal");
  const todoListContainer = document.getElementById("todoList");
  const todoTitleInput = document.getElementById("todoTitleInput");
  const todoDescInput = document.getElementById("todoDescInput");
  const saveButton = document.getElementById("saveTodo");

  const dayName = getDayName(dayIndex);
  document.querySelector("#todoModal h2").innerText = `${dayName}'s Tasks`;

  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  renderTodoList(todoList, todoListContainer, dayIndex, "week");

  // Handle Save Button
  const newSaveBtn = saveButton.cloneNode(true);
  saveButton.parentNode.replaceChild(newSaveBtn, saveButton);

  newSaveBtn.addEventListener("click", () => {
    const newTitle = todoTitleInput.value.trim();
    const newDesc = todoDescInput.value.trim();
    if (newTitle && newDesc) {
      const newTodo = { title: newTitle, description: newDesc };
      todoList.push(newTodo);
      localStorage.setItem(storageKey, JSON.stringify(todoList));

      renderTodoList(todoList, todoListContainer, dayIndex, "week");
      updateCurrentDay();

      todoTitleInput.value = "";
      todoDescInput.value = "";
    }
  });

  modal.style.display = "block";
}

// Updated Render using Data Attributes (No inline onclick)
function renderTodoList(list, container, dayIndex, type = "week") {
  container.innerHTML = list
    .map(
      (item, i) => `
      <div class="todo-item" draggable="true" id="todo_${dayIndex}_${i}" data-index="${i}" data-day="${dayIndex}">
        <div class="content">
          <h3>${item.title}</h3>
        </div>
        <div class="actions">
          <button class="delete" data-action="delete" data-index="${i}" data-day="${dayIndex}" data-type="${type}">Delete</button>
          <button class="view" data-action="view" data-index="${i}" data-day="${dayIndex}" data-type="${type}">View</button>
        </div>
      </div>
    `
    )
    .join("");
}

function deleteTodoItem(dayIndex, itemIndex) {
  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  todoList.splice(itemIndex, 1);
  localStorage.setItem(storageKey, JSON.stringify(todoList));

  renderTodoList(
    todoList,
    document.getElementById("todoList"),
    dayIndex,
    "week"
  );
  updateCurrentDay();
}

function viewTodoDetails(dayIndex, itemIndex) {
  const storageKey = `todo_week_${dayIndex}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  const todoDetails = document.getElementById("todoDetails");
  const todoDetailsContent = document.getElementById("todoDetailsContent");

  if (todoList[itemIndex]) {
    todoDetailsContent.innerHTML = `
        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">${todoList[itemIndex].title}</h3>
        <textarea readonly style="width: 100%; height: 150px; background: #27272a; color: white; padding: 10px; border-radius: 8px;">${todoList[itemIndex].description}</textarea>
      `;
    todoDetails.style.display = "flex";
  }
}

function editTodoItem(dayIndex, itemIndex, field) {
    const storageKey = `todo_week_${dayIndex}`;
    const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const newVal = prompt("Edit:", todoList[itemIndex][field]);
    if(newVal) {
        todoList[itemIndex][field] = newVal;
        localStorage.setItem(storageKey, JSON.stringify(todoList));
        renderTodoList(todoList, document.getElementById("todoList"), dayIndex);
    }
}

// ==========================================
// 4. SHORTCUT LOGIC
// ==========================================

function handleTimeClick() {
  // Dynamic Modal Creation for Shortcuts
  let modal = document.getElementById("shortcutModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "shortcutModal";
    modal.className = "modal";
    modal.style.display = "none";
    // ... styling handled in CSS usually, but inline for safety
    modal.style.cssText = "position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.8);";
    
    modal.innerHTML = `
      <div class="modal-content" style="background: #18181b; padding: 24px; border-radius: 16px; border: 1px solid #27272a; max-width: 500px; margin: 10% auto; position: relative;">
        <h2 style="color: white; margin-bottom: 20px;">Shortcuts</h2>
        <input type="text" id="shortcutName" placeholder="Name" style="width: 100%; padding: 10px; margin-bottom: 10px; background: #27272a; border: 1px solid #3f3f46; color: white; border-radius: 8px;">
        <input type="text" id="shortcutUrl" placeholder="URL (https://...)" style="width: 100%; padding: 10px; margin-bottom: 20px; background: #27272a; border: 1px solid #3f3f46; color: white; border-radius: 8px;">
        <button id="addShortcutBtn" style="width: 100%; padding: 10px; background: white; color: black; border-radius: 8px; font-weight: bold; cursor: pointer;">Add Shortcut</button>
        <div id="shortcutList" style="margin-top: 20px; color: #a1a1aa;"></div>
        <span id="closeShortcutModal" style="position: absolute; top: 20px; right: 20px; color: white; cursor: pointer; font-size: 24px;">&times;</span>
      </div>
    `;
    document.body.appendChild(modal);

    // Bind dynamic buttons
    document.getElementById('addShortcutBtn').addEventListener('click', addShortcut);
    document.getElementById('closeShortcutModal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Delegation for delete shortcut
    document.getElementById('shortcutList').addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON') {
            const idx = e.target.dataset.index;
            deleteShortcut(idx);
        }
    });
  }
  
  displayShortcuts();
  modal.style.display = "block";
}

function updateClockAreaShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
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
            <img src="${getFaviconUrl(shortcut.url)}" style="width: 16px; height: 16px; border-radius: 2px;">
        </a>
      `
      )
      .join("");
  } else {
    shortcutContainer.style.display = "none";
  }
}

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
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: #27272a; border-radius: 8px;">
            <span style="color: #e4e4e7;">${s.name}</span>
            <button data-index="${i}" style="color: #ef4444; background: none; border: none; cursor: pointer;">Delete</button>
        </div>`
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

function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch (e) {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><circle cx="12" cy="12" r="10"/></svg>';
  }
}

// ==========================================
// 5. YEAR GRID LOGIC
// ==========================================

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

  daysLeftContainer.style.display = "grid";
  daysLeftContainer.style.gridTemplateColumns =
    "repeat(auto-fit, minmax(calc(100% / 28), 1fr))";
  daysLeftContainer.style.gap = "6px";
  daysLeftContainer.style.alignContent = "start";

  const boxStyle =
    "width: 100%; aspect-ratio: 1; border-radius: 4px; cursor: pointer; position: relative; transition: transform 0.2s;";

  // Generate HTML with Data Attributes (No inline onclick)
  daysLeftContainer.innerHTML = `
    ${Array.from(
      { length: dayOfYear },
      (_, i) => `
        <div class="year-box"
             data-day="${i + 1}"
             title="Day ${i + 1}"
             style="${boxStyle} background: ${
        i + 1 === dayOfYear ? "#fff" : "#71717a"
      };
                  box-shadow: ${
                    i + 1 === dayOfYear
                      ? "0 0 15px rgba(255,255,255,0.6)"
                      : "none"
                  };
                  z-index: ${i + 1 === dayOfYear ? "2" : "1"};">
            ${getYearTodoIndicator(i + 1)}
        </div>
    `
    ).join("")}

    ${Array.from(
      { length: daysLeft },
      (_, i) => `
        <div class="year-box"
             data-day="${dayOfYear + i + 1}"
             title="Day ${dayOfYear + i + 1}"
             style="${boxStyle} background: #27272a;">
            ${getYearTodoIndicator(dayOfYear + i + 1)}
        </div>
    `
    ).join("")}
  `;
}

function getYearTodoIndicator(day) {
  const todos = JSON.parse(localStorage.getItem(`todo_day_${day}`)) || [];
  if (todos.length > 0) {
    return `<div style="position: absolute; top: -2px; right: -2px; width: 4px; height: 4px; background: #3b82f6; border-radius: 50%;"></div>`;
  }
  return "";
}

function handleYearClick(day) {
  const modal = document.getElementById("todoModal");
  const todoListContainer = document.getElementById("todoList");
  const todoTitleInput = document.getElementById("todoTitleInput");
  const todoDescInput = document.getElementById("todoDescInput");
  const saveButton = document.getElementById("saveTodo");

  document.querySelector("#todoModal h2").innerText = `Day ${day} of 365`;

  const storageKey = `todo_day_${day}`;
  const todoList = JSON.parse(localStorage.getItem(storageKey)) || [];

  renderTodoList(todoList, todoListContainer, day, "year");

  const newSaveBtn = saveButton.cloneNode(true);
  saveButton.parentNode.replaceChild(newSaveBtn, saveButton);

  newSaveBtn.addEventListener("click", () => {
    const title = todoTitleInput.value.trim();
    const desc = todoDescInput.value.trim();
    if (title && desc) {
      const list = JSON.parse(localStorage.getItem(storageKey)) || [];
      list.push({ title, description: desc });
      localStorage.setItem(storageKey, JSON.stringify(list));

      renderTodoList(list, todoListContainer, day, "year");
      updateDaysLeft();

      todoTitleInput.value = "";
      todoDescInput.value = "";
    }
  });

  modal.style.display = "block";
}

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

function closeModal() {
  document.getElementById("todoModal").style.display = "none";
}
function closeTodoDetails() {
  document.getElementById("todoDetails").style.display = "none";
}

// ==========================================
// 6. DRAG AND DROP UTILS
// ==========================================

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
  if (draggedElement && event.target.closest(".todo-item")) {
    event.target
      .closest(".todo-item")
      .insertAdjacentElement("beforebegin", draggedElement);
  }
}