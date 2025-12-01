import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { taskService } from "@/services/api/taskService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import TaskList from "@/components/organisms/TaskList";
import TaskForm from "@/components/molecules/TaskForm";
import FilterBar from "@/components/molecules/FilterBar";

const TaskManager = () => {
const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [creatingSubtaskFor, setCreatingSubtaskFor] = useState(null);
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleCreateTask = async (taskData) => {
    try {
      // If creating subtask, add parentId
      if (creatingSubtaskFor) {
        taskData.parentId = creatingSubtaskFor.Id;
      }
      
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
      setCreatingSubtaskFor(null);
      
      const message = creatingSubtaskFor ? "Subtask created successfully!" : "Task created successfully!";
      toast.success(message);
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Failed to create task");
    }
  };

  const handleCreateSubtask = (parentTask) => {
    setCreatingSubtaskFor(parentTask);
    setShowForm(true);
  };

const handleUpdateTask = async (taskData) => {
    if (!editingTask) return;

    try {
      const updatedTask = await taskService.update(editingTask.Id, taskData);
      setTasks(prev => prev.map(task => 
        task.Id === editingTask.Id ? updatedTask : task
      ));
      setEditingTask(null);
      setCreatingSubtaskFor(null);
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task");
    }
  };

const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.Id === taskId);
    if (!task) return;

    try {
      const updatedTask = await taskService.update(taskId, {
        completed: !task.completed
      });
      
      // Reload all tasks to get updated parent/child relationships
      const allTasks = await taskService.getAll();
      setTasks(allTasks);
      
      toast.success(
        updatedTask.completed ? "Task completed! 🎉" : "Task reopened"
      );
    } catch (err) {
      console.error("Failed to toggle task:", err);
      toast.error("Failed to update task");
    }
  };

const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.Id === taskId);
    const hasSubtasks = tasks.some(t => t.parentId === taskId);
    
    const confirmMessage = hasSubtasks 
      ? "Are you sure you want to delete this task and all its subtasks?" 
      : "Are you sure you want to delete this task?";
      
    if (!confirm(confirmMessage)) return;

    try {
      await taskService.delete(taskId);
      // Reload all tasks to ensure proper cleanup
      const allTasks = await taskService.getAll();
      setTasks(allTasks);
      toast.success("Task deleted successfully");
    } catch (err) {
      console.error("Failed to delete task:", err);
toast.error("Failed to delete task");
    }
  };
const getFilteredTasks = () => {
    // Start with main tasks only (no parent)
    let filtered = tasks.filter(task => !task.parentId);

    // Apply status filter
    if (activeFilter === "active") {
      filtered = filtered.filter(task => !task.completed);
    } else if (activeFilter === "completed") {
      filtered = filtered.filter(task => task.completed);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

const getTaskCounts = () => {
    // Count only main tasks for stats
    const mainTasks = tasks.filter(task => !task.parentId);
    return {
      all: mainTasks.length,
      active: mainTasks.filter(task => !task.completed).length,
      completed: mainTasks.filter(task => task.completed).length
    };
  };

  if (loading) return <Loading />;

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  const filteredTasks = getFilteredTasks();
  const taskCounts = getTaskCounts();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Quick Action Header */}
      <div className="flex items-center justify-between">
        <div>
<h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {taskCounts.active} active, {taskCounts.completed} completed
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2"
        >
          <ApperIcon name={showForm ? "X" : "Plus"} size={16} />
          <span>{showForm ? "Cancel" : "Add Task"}</span>
        </Button>
      </div>

      {/* Task Form */}
      {(showForm || editingTask) && (
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          initialData={editingTask}
        />
      )}

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        taskCounts={taskCounts}
      />

      {/* Task List */}
<TaskList
        tasks={filteredTasks}
        allTasks={tasks}
        onToggleComplete={handleToggleComplete}
        onEditTask={setEditingTask}
        onDeleteTask={handleDeleteTask}
        onCreateTask={() => setShowForm(true)}
        onCreateSubtask={handleCreateSubtask}
      />

      {/* Stats Summary */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Progress Summary</h3>
              <p className="text-sm text-gray-600 mt-1">
                Keep up the great work! You've completed {taskCounts.completed} out of {taskCounts.all} tasks.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {taskCounts.all > 0 ? Math.round((taskCounts.completed / taskCounts.all) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${taskCounts.all > 0 ? (taskCounts.completed / taskCounts.all) * 100 : 0}%` 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskManager;