// Function to update live time with milliseconds
function updateTime() {
  const timeDiv = document.getElementById("timeDisplay");
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  timeDiv.textContent = formattedTime;
}

// Function to calculate and display days left in the year
function updateDaysLeft() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Determine if the current year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const daysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
  const daysLeft = daysInYear - dayOfYear;

  const totalMinutesToday = 24 * 60; // Total minutes in a day
  const minutesElapsedToday = today.getHours() * 60 + today.getMinutes(); // Minutes elapsed so far
  const hoursLeftToday = 24 - today.getHours(); // Remaining hours today
  const percentageComplete = (
    (minutesElapsedToday / totalMinutesToday) *
    100
  ).toFixed(2); // Percentage complete

  console.log(`Hours left today: ${hoursLeftToday}`);
  console.log(`Percentage of the day complete: ${percentageComplete}%`);

  // const percentageComplete = ((dayOfYear / daysInYear) * 100).toFixed(2);

  setInterval(() => {
    percentageComplete = ((dayOfYear / daysInYear) * 100).toFixed(2);
    // updateDaysLeft();
  }, 10);

  // Update the percentage complete element
  let percentageCompleteElement = document.getElementById("percentageComplete");

  // Update the days left content
  const daysLeftContainer = document.getElementById("dayLeftContainer");
  daysLeftContainer.innerHTML = `
${Array.from(
  { length: dayOfYear },
  (_, index) => `
  <div
    style="${
      index + 1 === dayOfYear
        ? `background: linear-gradient(180deg, rgba(255, 255, 255, 1) ${percentageComplete}%, rgba(39, 39, 42, 1) ${percentageComplete}%);`
        : ""
    }"
    class="w-[40px] h-[40px] rounded ${
      index + 1 === dayOfYear ? "" : "bg-white"
    } flex items-center justify-center day-container relative"
    onclick="handleDayClick(${index + 1})"
  >
    ${
      index + 1 === dayOfYear
        ? `<span class="text-xs font-bold text-black">${percentageComplete}%</span>`
        : ""
    }
    <span class="day-tooltip">Day ${index + 1} - Click to add tasks</span>
    <span class="add-task-hint">+</span>
    ${getTodoCount(index + 1)}
  </div>
`
).join("")}

${Array.from(
  { length: daysLeft },
  (_, index) => `
  <div 
    class="w-[40px] h-[40px] bg-zinc-800 rounded day-container relative" 
    onclick="handleDayClick(${dayOfYear + index + 1})"
  >
    <span class="day-tooltip">Day ${
      dayOfYear + index + 1
    } - Click to add tasks</span>
    <span class="add-task-hint">+</span>
    ${getTodoCount(dayOfYear + index + 1)}
  </div>
`
).join("")}
`;

  // Update the days left element
  let daysLeftElement = document.getElementById("daysLeft");
  if (!daysLeftElement) {
    daysLeftElement = document.createElement("div");
    daysLeftElement.id = "daysLeft";
    daysLeftElement.className = "text-xl mt-2";
    document.body.appendChild(daysLeftElement);
  }

  // Style the days left container
  daysLeftContainer.style.display = "flex";
  daysLeftContainer.style.flexWrap = "wrap";
  daysLeftContainer.style.gap = "4px";
  daysLeftContainer.style.padding = "1%";
  daysLeftContainer.style.overflowX = "hidden";
  daysLeftContainer.style.overflowY = "auto";
  daysLeftContainer.style.width = "fit-content";
}

// Add this new function to show todo count
function getTodoCount(day) {
  const todos = JSON.parse(localStorage.getItem(`todo_${day}`)) || [];
  if (todos.length > 0) {
    return `<span class="absolute bottom-0 right-0 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${todos.length}</span>`;
  }
  return "";
}

// Function to handle day box click
function handleDayClick(day) {
  const modal = document.getElementById("todoModal");
  const todoListContainer = document.getElementById("todoList");
  const todoTitleInput = document.getElementById("todoTitleInput");
  const todoDescInput = document.getElementById("todoDescInput");
  const saveButton = document.getElementById("saveTodo");

  const todoList = JSON.parse(localStorage.getItem(`todo_${day}`)) || [];
  todoListContainer.innerHTML = todoList
    .map(
      (item, index) => `
          <div class="todo-item" draggable="true" ondragstart="drag(event)" id="todo_${day}_${index}">
            <div class="content">
              <h3 ondblclick="editTodoItem(${day}, ${index}, 'title')">${item.title}</h3>
            </div>
            <div class="actions">
              <button class="delete" onclick="deleteTodoItem(${day}, ${index}, event)">Delete</button>
              <button class="view" onclick="viewTodoDetails(${day}, ${index}, event)">View</button>
            </div>
          </div>
        `
    )
    .join("");

  saveButton.onclick = () => {
    const newTitle = todoTitleInput.value.trim();
    const newDesc = todoDescInput.value.trim();
    if (newTitle && newDesc) {
      const newTodo = { title: newTitle, description: newDesc };
      todoList.push(newTodo);
      localStorage.setItem(`todo_${day}`, JSON.stringify(todoList));
      todoListContainer.innerHTML += `
          <div class="todo-item" draggable="true" ondragstart="drag(event)" id="todo_${day}_${
        todoList.length - 1
      }">
            <div class="content">
              <h3 ondblclick="editTodoItem(${day}, ${
        todoList.length - 1
      }, 'title')">${newTitle}</h3>
            </div>
            <div class="actions">
              <button class="delete" onclick="deleteTodoItem(${day}, ${
        todoList.length - 1
      }, event)">Delete</button>
              <button class="view" onclick="viewTodoDetails(${day}, ${
        todoList.length - 1
      }, event)">View</button>
            </div>
          </div>
        `;
      todoTitleInput.value = "";
      todoDescInput.value = "";
    }
  };

  modal.style.display = "block";
}

// Function to delete a to-do item
function deleteTodoItem(day, index, event) {
  event.stopPropagation();
  const todoList = JSON.parse(localStorage.getItem(`todo_${day}`)) || [];
  todoList.splice(index, 1);
  localStorage.setItem(`todo_${day}`, JSON.stringify(todoList));
  handleDayClick(day);
}

// Function to edit a to-do item
function editTodoItem(day, index, field) {
  const todoList = JSON.parse(localStorage.getItem(`todo_${day}`)) || [];
  const newValue = prompt(`Edit your to-do ${field}:`, todoList[index][field]);
  if (newValue !== null) {
    todoList[index][field] = newValue.trim();
    localStorage.setItem(`todo_${day}`, JSON.stringify(todoList));
    handleDayClick(day);
  }
}

// Function to view to-do details
function viewTodoDetails(day, index, event) {
  event.stopPropagation();
  const todoList = JSON.parse(localStorage.getItem(`todo_${day}`)) || [];
  const todoDetails = document.getElementById("todoDetails");
  const todoDetailsContent = document.getElementById("todoDetailsContent");
  todoDetailsContent.innerHTML = `
      <h3>${todoList[index].title}</h3>
      <textarea readonly>${todoList[index].description}</textarea>
    `;
  todoDetails.style.display = "block";
}

// Close the to-do details
function closeTodoDetails() {
  document.getElementById("todoDetails").style.display = "none";
}

// Drag and drop functions
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

// Close the modal
function closeModal() {
  document.getElementById("todoModal").style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("todoModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Update live time and days left every second
setInterval(() => {
  updateTime();
}, 1);

let lastHour = new Date().getHours();

setInterval(() => {
  const currentHour = new Date().getHours();
  if (currentHour !== lastHour) {
    updateDaysLeft();
    lastHour = currentHour;
  }
}, 1000);

// Ensure the container becomes visible
window.onload = () => {
  updateTime();
  updateDaysLeft();
};
