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
    }

    this.saveToStorage();
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(200);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return false;

    tasks.splice(index, 1);
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
  }
};

// Load from storage when service is imported
if (typeof window !== "undefined") {
  taskService.loadFromStorage();
}