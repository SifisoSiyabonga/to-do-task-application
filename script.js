// --- DOM Selection ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const errorMessage = document.getElementById("error-message");
const emptyState = document.getElementById("empty-state");

// Controls and Buttons
const filterBtns = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");

// Statistic Displays
const totalTasksEl = document.getElementById("total-tasks");
const pendingTasksEl = document.getElementById("pending-tasks");
const completedTasksEl = document.getElementById("completed-tasks");

// --- Global State ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// --- Event Listeners ---
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
});
searchInput.addEventListener("input", renderTasks);

// Connect filters
filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        filterBtns.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentFilter = e.target.getAttribute("data-filter");
        renderTasks();
    });
});

// Structural Clears
clearCompletedBtn.addEventListener("click", clearCompletedTasks);
deleteAllBtn.addEventListener("click", deleteAllTasks);

// --- Functions ---

// 1. Add Task (Includes validation and checks)
function addTask() {
    const text = taskInput.value.trim();
    errorMessage.textContent = ""; // Clear errors

    // Challenge 1: Avoid empty submissions
    if (text === "") {
        errorMessage.textContent = "Task title cannot be left blank.";
        return;
    }

    // Challenge 2: Avoid duplicates (case-insensitive check)
    const isDuplicate = tasks.some(task => task.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        errorMessage.textContent = "This task already exists in your list.";
        return;
    }

    // Build the data object
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    taskInput.value = "";
    taskInput.focus();
}

// 2. Render System (Constructs UI elements smoothly)
function renderTasks() {
    taskList.innerHTML = "";
    const searchQuery = searchInput.value.toLowerCase().trim();

    // Challenge: Filter & Search logic
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery);
        
        if (currentFilter === "active") return !task.completed && matchesSearch;
        if (currentFilter === "completed") return task.completed && matchesSearch;
        return matchesSearch; // "all"
    });

    // Toggle Empty State illustration
    if (filteredTasks.length === 0) {
        emptyState.style.display = "flex";
    } else {
        emptyState.style.display = "none";
    }

    // Append nodes dynamically
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute("data-id", task.id);

        li.innerHTML = `
            <div class="task-left" onclick="toggleTaskStatus(${task.id})">
                <div class="custom-checkbox">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" title="Edit Task">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateCounters();
}

// 3. Toggle Status (Complete / Incomplete)
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// 4. Edit Task
function editTask(id) {
    const taskToEdit = tasks.find(task => task.id === id);
    if (!taskToEdit) return;

    const updatedText = prompt("Update your task details:", taskToEdit.text);
    
    if (updatedText === null) return; // Action cancelled
    const trimmedText = updatedText.trim();

    if (trimmedText === "") {
        alert("Task details cannot be saved blank!");
        return;
    }

    // Prevent editing into another existing duplicate task
    const isDuplicate = tasks.some(task => task.id !== id && task.text.toLowerCase() === trimmedText.toLowerCase());
    if (isDuplicate) {
        alert("A task with that name already exists!");
        return;
    }

    taskToEdit.text = trimmedText;
    saveAndRender();
}

// 5. Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// 6. Bulk Action: Clear Completed tasks
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
}

// 7. Bulk Action: Delete All tasks
function deleteAllTasks() {
    if (tasks.length === 0) return;
    const confirmClear = confirm("Are you sure you want to clear your entire task queue?");
    if (confirmClear) {
        tasks = [];
        saveAndRender();
    }
}

// 8. Update Counter Statistics Dashboard
function updateCounters() {
    const totalCount = tasks.length;
    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = totalCount - completedCount;

    totalTasksEl.textContent = totalCount;
    pendingTasksEl.textContent = pendingCount;
    completedTasksEl.textContent = completedCount;
}

// 9. Sync and Persistent Storage Save
function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

// Security: Prevent malicious code injection (XSS validation)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// --- Initial Render ---
renderTasks();