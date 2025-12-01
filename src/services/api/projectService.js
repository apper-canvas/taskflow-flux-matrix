import projectsData from "@/services/mockData/projects.json";

let projects = [...projectsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const projectService = {
  async getAll() {
    await delay(300);
    return projects.map(project => ({ ...project }));
  },

  async getById(id) {
    await delay(200);
    const project = projects.find(p => p.Id === parseInt(id));
    return project ? { ...project } : null;
  },

  async create(projectData) {
    await delay(250);
    const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.Id)) : 0;
    const newProject = {
      Id: maxId + 1,
      name: projectData.name,
      description: projectData.description || "",
      status: projectData.status || "active",
      priority: projectData.priority || "medium",
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      dueDate: projectData.dueDate || null,
      color: projectData.color || "#4F46E5",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    this.saveToStorage();
    return { ...newProject };
  },

  async update(id, updates) {
    await delay(200);
    const index = projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage();
    return { ...projects[index] };
  },

  async delete(id) {
    await delay(200);
    const index = projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) return false;

    projects.splice(index, 1);
    this.saveToStorage();
    return true;
  },

  async getByStatus(status) {
    await delay(200);
    return projects
      .filter(project => project.status === status)
      .map(project => ({ ...project }));
  },

  async search(query) {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();
    return projects
      .filter(project => 
        project.name.toLowerCase().includes(lowercaseQuery) ||
        project.description.toLowerCase().includes(lowercaseQuery)
      )
      .map(project => ({ ...project }));
  },

  saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskflow_projects", JSON.stringify(projects));
    }
  },

  loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("taskflow_projects");
      if (stored) {
        try {
          projects = JSON.parse(stored);
        } catch (error) {
          console.error("Failed to load projects from storage:", error);
        }
      }
    }
  }
};

// Load from storage when service is imported
if (typeof window !== "undefined") {
  projectService.loadFromStorage();
}