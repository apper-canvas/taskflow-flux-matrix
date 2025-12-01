import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProjectStats = () => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const planningProjects = projects.filter(p => p.status === 'planning').length;
    
    return {
      total: projects.length,
      active: activeProjects,
      completed: completedProjects,
      planning: planningProjects
    };
  };

  const getTaskStats = () => {
    const activeTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      total: tasks.length,
      active: activeTasks,
      completed: completedTasks,
      overdue: overdueTasks
    };
  };

  const getRecentProjects = () => {
    return projects
      .filter(p => p.status === 'active')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);
  };

  const getRecentTasks = () => {
    return tasks
      .filter(t => !t.completed)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  if (loading) return <Loading />;

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  const projectStats = getProjectStats();
  const taskStats = getTaskStats();
  const recentProjects = getRecentProjects();
  const recentTasks = getRecentTasks();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your projects and tasks.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 task-card-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ApperIcon name="FolderOpen" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex space-x-2 text-xs">
            <span className="text-green-600">{projectStats.active} active</span>
            <span className="text-gray-400">•</span>
            <span className="text-blue-600">{projectStats.planning} planning</span>
          </div>
        </motion.div>

        {/* Tasks Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 task-card-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ApperIcon name="CheckSquare" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex space-x-2 text-xs">
            <span className="text-orange-600">{taskStats.active} pending</span>
            <span className="text-gray-400">•</span>
            <span className="text-green-600">{taskStats.completed} done</span>
          </div>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 task-card-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Task Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ApperIcon name="TrendingUp" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-primary-500 h-2 rounded-full"
                style={{
                  width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Overdue Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 task-card-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <ApperIcon name="AlertTriangle" size={24} className="text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            {taskStats.overdue > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/tasks')}
                className="text-xs"
              >
                View Tasks
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 task-card-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-sm"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active projects</p>
            ) : (
              recentProjects.map((project) => (
                <div key={project.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.progress}% complete</p>
                    </div>
                  </div>
                  <Badge variant={project.priority === 'high' ? 'destructive' : project.priority === 'medium' ? 'default' : 'secondary'}>
                    {project.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 task-card-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-sm"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending tasks</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Circle" size={16} className="text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.category}</p>
                    </div>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;