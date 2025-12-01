import categoriesData from "@/services/mockData/categories.json";

let categories = [...categoriesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getAll() {
    await delay(200);
    return categories.map(category => ({ ...category }));
  },

  async getById(id) {
    await delay(150);
    const category = categories.find(c => c.Id === parseInt(id));
    return category ? { ...category } : null;
  },

  async create(categoryData) {
    await delay(200);
    const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.Id)) : 0;
    const newCategory = {
      Id: maxId + 1,
      name: categoryData.name,
      color: categoryData.color || "#7C3AED",
      taskCount: 0
    };
    categories.push(newCategory);
    this.saveToStorage();
    return { ...newCategory };
  },

  async update(id, updates) {
    await delay(150);
    const index = categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return null;

    categories[index] = {
      ...categories[index],
      ...updates,
      Id: parseInt(id)
    };

    this.saveToStorage();
    return { ...categories[index] };
  },

  async delete(id) {
    await delay(150);
    const index = categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return false;

    categories.splice(index, 1);
    this.saveToStorage();
    return true;
  },

  saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskflow_categories", JSON.stringify(categories));
    }
  },

  loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("taskflow_categories");
      if (stored) {
        try {
          categories = JSON.parse(stored);
        } catch (error) {
          console.error("Failed to load categories from storage:", error);
        }
      }
    }
  }
};

// Load from storage when service is imported
if (typeof window !== "undefined") {
  categoryService.loadFromStorage();
}