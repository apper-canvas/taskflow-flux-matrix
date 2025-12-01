import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { taskService } from "@/services/api/taskService";
import { format, isPast, isToday } from "date-fns";

const KanbanBoard = ({ projectId, tasks, onTaskUpdate, onTaskEdit, onAddTask }) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  const columns = [
    {
      id: 'not-started',
      title: 'Not Started',
      status: 'not-started',
      icon: 'Circle',
      color: 'bg-gray-100',
      borderColor: 'border-gray-200'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      icon: 'Clock',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      icon: 'CheckCircle2',
      color: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => {
      if (status === 'not-started') return !task.status || task.status === 'not-started';
      if (status === 'in-progress') return task.status === 'in-progress';
      if (status === 'completed') return task.completed || task.status === 'completed';
      return false;
    });
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    if (!draggedTask) return;

    const newStatus = columnId;
    if (draggedTask.status === newStatus || 
        (draggedTask.completed && newStatus === 'completed') ||
        (!draggedTask.status && newStatus === 'not-started')) {
      return;
    }

    try {
      await taskService.updateTaskStatus(draggedTask.Id, newStatus);
      onTaskUpdate();
      toast.success(`Task moved to ${columns.find(c => c.status === newStatus)?.title}`);
    } catch (error) {
      toast.error('Failed to update task status');
    }

    setDraggedTask(null);
    setDraggedOver(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    return format(date, 'MMM d');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        const isDraggedOver = draggedOver === column.status;

        return (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: columns.indexOf(column) * 0.1 }}
            className={`flex-1 min-h-0 ${column.color} rounded-lg border ${column.borderColor} ${
              isDraggedOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
            } transition-all duration-200`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name={column.icon} size={18} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
                {column.status === 'not-started' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddTask}
                    className="p-1 h-7 w-7"
                  >
                    <ApperIcon name="Plus" size={14} />
                  </Button>
                )}
              </div>
            </div>

            {/* Column Content */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <ApperIcon name="Package" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <motion.div
                    key={task.Id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg p-4 task-card-shadow hover:task-card-shadow-hover cursor-move border-l-4 ${
                      task.priority === 'high' ? 'border-red-500' :
                      task.priority === 'medium' ? 'border-yellow-500' :
                      task.priority === 'low' ? 'border-green-500' : 'border-gray-300'
                    } ${draggedTask?.Id === task.Id ? 'opacity-50' : ''} transition-all duration-200`}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
                        {task.title}
                      </h4>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskEdit(task);
                          }}
                          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <ApperIcon name="Edit" size={12} />
                        </Button>
                      </div>
                    </div>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Task Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        {task.priority && (
                          <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        )}
                        {task.category && (
                          <span className="category-tag">
                            {task.category}
                          </span>
                        )}
                      </div>

                      {task.dueDate && (
                        <div className={`flex items-center space-x-1 ${
                          isOverdue(task.dueDate) ? 'text-red-600' :
                          isToday(new Date(task.dueDate)) ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          <ApperIcon 
                            name={isOverdue(task.dueDate) ? "AlertTriangle" : "Calendar"} 
                            size={12} 
                          />
                          <span>{formatDueDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Subtasks indicator */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <ApperIcon name="List" size={12} />
                          <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;