import tasksData from "@/services/mockData/tasks.json";

let tasks = [...tasksData];
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    await delay(300);
    return tasks.map(task => ({ ...task }));
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id));
    return task ? { ...task } : null;
  },

  async create(taskData) {
    await delay(250);
const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    const newTask = {
      Id: maxId + 1,
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate || null,
      category: taskData.category || "Personal",
      projectId: taskData.projectId || null,
      parentId: taskData.parentId || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    tasks.push(newTask);
    this.saveToStorage();
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(200);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return null;

tasks[index] = {
      ...tasks[index],
      ...updates,
      Id: parseInt(id)
    };

    if (updates.completed !== undefined) {
      tasks[index].completedAt = updates.completed ? new Date().toISOString() : null;
      
      // Update parent task completion if all subtasks are completed
      if (tasks[index].parentId) {
        this.updateParentTaskCompletion(tasks[index].parentId);
      }
    }

    this.saveToStorage();
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(200);
const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return false;

    const task = tasks[index];
    
    // Delete all subtasks first
    const subtasks = tasks.filter(t => t.parentId === parseInt(id));
    subtasks.forEach(subtask => {
      const subtaskIndex = tasks.findIndex(t => t.Id === subtask.Id);
      if (subtaskIndex !== -1) {
        tasks.splice(subtaskIndex, 1);
      }
    });

    // Delete the main task
    const updatedIndex = tasks.findIndex(t => t.Id === parseInt(id));
    if (updatedIndex !== -1) {
      tasks.splice(updatedIndex, 1);
    }

    // Update parent completion if this was a subtask
    if (task.parentId) {
      this.updateParentTaskCompletion(task.parentId);
    }

    this.saveToStorage();
    return true;
  },

  async getByStatus(completed) {
    await delay(200);
    return tasks
      .filter(task => task.completed === completed)
      .map(task => ({ ...task }));
  },

  async search(query) {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();
    return tasks
      .filter(task => 
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description.toLowerCase().includes(lowercaseQuery)
      )
      .map(task => ({ ...task }));
  },

  saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    }
  },

  loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("taskflow_tasks");
      if (stored) {
        try {
          tasks = JSON.parse(stored);
        } catch (error) {
          console.error("Failed to load tasks from storage:", error);
        }
      }
}
  },

  // Helper method to update parent task completion based on subtasks
  updateParentTaskCompletion(parentId) {
    const parent = tasks.find(t => t.Id === parseInt(parentId));
    if (!parent) return;

    const subtasks = tasks.filter(t => t.parentId === parseInt(parentId));
    if (subtasks.length === 0) return;

    const allSubtasksCompleted = subtasks.every(subtask => subtask.completed);
    const anySubtaskCompleted = subtasks.some(subtask => subtask.completed);
    
    // Only auto-complete parent if all subtasks are completed and parent isn't already completed
    if (allSubtasksCompleted && !parent.completed) {
      const parentIndex = tasks.findIndex(t => t.Id === parseInt(parentId));
      if (parentIndex !== -1) {
        tasks[parentIndex].completed = true;
        tasks[parentIndex].completedAt = new Date().toISOString();
        this.saveToStorage();
      }
    }
    // Auto-uncomplete parent if it was completed but now has incomplete subtasks
    else if (!allSubtasksCompleted && parent.completed && anySubtaskCompleted) {
      const parentIndex = tasks.findIndex(t => t.Id === parseInt(parentId));
      if (parentIndex !== -1) {
        tasks[parentIndex].completed = false;
        tasks[parentIndex].completedAt = null;
        this.saveToStorage();
      }
    }
  },

  // Get subtasks for a parent task
  getSubtasks(parentId) {
    return tasks
      .filter(task => task.parentId === parseInt(parentId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  // Get all main tasks (tasks without parent)
  getMainTasks() {
    return tasks
      .filter(task => !task.parentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// Load from storage when service is imported
if (typeof window !== "undefined") {
  taskService.loadFromStorage();
}