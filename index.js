const API_URL = "http://localhost:3001/tasks";

const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task-btn");

// Fetch tasks from db.json
const fetchTasks = async () => {
  const response = await fetch(API_URL);
  const tasks = await response.json();
  renderTasks(tasks);
};

// Render tasks
const renderTasks = (tasks) => {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <span class="title-${task.id}">${task.title}</span>
      <div>
        <button class="edit-btn" type="button" onclick="editTask(${task.id})">Edit</button>
        <button class="toggle-btn-${task.id}" type="button" onclick="fetchTaskAndToggle(${task.id})">${task.completed ? "Undo": "Done"}</button>
        <button class="delete-btn" type="button" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
};

// Add a new task
addTaskBtn.addEventListener("click", async (event) => {
  event.preventDefault();  // Prevent the page from refreshing
 
  const title = taskInput.value.trim();
  if(title == ""){
   const error_msg = document.getElementById("task-input");
   error_msg.style.border = "2px solid red"
  }
  if (title) {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false }),
    });
    taskInput.value = "";
    fetchTasks();
  }
});

// Toggle task completion
const toggleComplete = (id, completed) => {
    const title = document.getElementsByClassName(`title-${id}`)[0];  // Get the first item in the collection
    const btn = document.querySelector(`.toggle-btn-${id}`);  // Get the button for this specific task

    if (!title || !btn) {
        console.error('Title or button element not found.');
        return;
    }

    // Toggle the completed status
    const newCompletedStatus = !completed;

    // Update the UI based on the new completed status
    if (newCompletedStatus) {
        title.style.textDecoration = 'line-through';
        btn.innerHTML = "Undo";
    } else {
        title.style.textDecoration = 'none';
        btn.innerHTML = "Done";
    }

    // Call the API to update the completed status in the database
    updateTaskCompletion(id, newCompletedStatus);
}

const updateTaskCompletion = async (id, completed) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: completed,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update task completion');
        }
    } catch (error) {
        console.error('Error updating task completion:', error);
    }
}

// Edit task
const editTask = async (id) => {
    try {
        const newTaskName = prompt("Enter task name").trim();
        if(newTaskName == "") {
            return
        }
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTaskName }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to edit task with id ${id}`);
      }
  
      const updatedTask = await response.json();
      console.log("Task updated:", updatedTask);
      fetchTasks(); // Re-fetch tasks after update
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

// Fetch the task and toggle its completion status
const fetchTaskAndToggle = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const task = await response.json();

        // Get the task's 'completed' status and toggle the UI accordingly
        toggleComplete(id, task.completed);
    } catch (error) {
        console.error('Error fetching task:', error);
    }
}

// Delete task
const deleteTask = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  fetchTasks();
};

// Initial fetch to load tasks
fetchTasks();
