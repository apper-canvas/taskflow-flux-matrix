import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/atoms/Modal";
import { projectService } from "@/services/api/projectService";
import { taskService } from "@/services/api/taskService";
import KanbanBoard from "@/components/organisms/KanbanBoard";
import TaskList from "@/components/organisms/TaskList";
import CalendarView from "@/components/organisms/CalendarView";
import TaskForm from "@/components/molecules/TaskForm";
const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('kanban');
const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, tasksData] = await Promise.all([
        projectService.getById(parseInt(projectId)),
        taskService.getTasksByProject(projectId)
      ]);
      
      setProject(projectData);
      setTasks(tasksData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async () => {
    try {
      const tasksData = await taskService.getTasksByProject(projectId);
      setTasks(tasksData || []);
    } catch (err) {
      toast.error('Failed to refresh tasks');
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      const taskPayload = {
        ...taskData,
        projectId: parseInt(projectId),
        status: 'not-started'
      };

      if (editingTask) {
        await taskService.update(editingTask.Id, taskPayload);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(taskPayload);
        toast.success('Task created successfully');
      }
      
      setShowTaskForm(false);
      setEditingTask(null);
      handleTaskUpdate();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted successfully');
      handleTaskUpdate();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadProjectData} />;
  if (!project) return <ErrorView message="Project not found" onRetry={() => navigate('/projects')} />;

  const views = [
    { key: 'kanban', label: 'Kanban Board', icon: 'Kanban' },
    { key: 'list', label: 'List View', icon: 'List' },
    { key: 'calendar', label: 'Calendar', icon: 'Calendar' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      {/* Project Header */}
      <div className="bg-white rounded-lg p-6 task-card-shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Badge variant={getPriorityColor(project.priority)}>
              {project.priority} priority
            </Badge>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{project.description}</p>

        {/* Project Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-gray-500">Progress: </span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Tasks: </span>
              <span className="font-medium">{tasks.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Due: </span>
              <span className="font-medium">
                {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
              </span>
            </div>
          </div>

          <Button
onClick={() => setShowTaskForm(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg p-4 task-card-shadow mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-900">View:</h3>
          <div className="flex space-x-2">
            {views.map((view) => (
              <Button
                key={view.key}
                variant={activeView === view.key ? "primary" : "ghost"}
size="sm"
                onClick={() => setActiveView(view.key)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name={view.icon} size={14} />
                <span>{view.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg task-card-shadow flex-1 overflow-hidden">
        {activeView === 'kanban' && (
          <div className="p-6 h-full">
            <KanbanBoard
              projectId={projectId}
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskEdit={handleEditTask}
              onAddTask={() => setShowTaskForm(true)}
            />
          </div>
        )}

        {activeView === 'list' && (
          <div className="p-6">
            <TaskList
              tasks={tasks}
              onTaskEdit={handleEditTask}
              onTaskDelete={handleDeleteTask}
              onTaskToggle={async (taskId, completed) => {
                try {
                  await taskService.update(taskId, { completed });
                  handleTaskUpdate();
                  toast.success(completed ? 'Task completed' : 'Task marked as incomplete');
                } catch (error) {
                  toast.error('Failed to update task');
                }
              }}
            />
          </div>
        )}

{activeView === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onTaskEdit={handleEditTask}
            onTaskUpdate={handleTaskUpdate}
          />
        )}
      </div>

{/* Task Form Modal */}
      <Modal isOpen={showTaskForm || editingTask} onClose={() => {
        setShowTaskForm(false);
        setEditingTask(null);
      }}>
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          categories={['Work', 'Personal', 'Learning', 'Health', 'Career']}
        />
      </Modal>
    </motion.div>
  );
};

export default ProjectDetail;