import { motion } from "framer-motion";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Checkbox from "@/components/atoms/Checkbox";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, subtasks = [], onCreateSubtask }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const getPriorityBadge = (priority) => {
    const badges = {
      high: { variant: "high", icon: "AlertTriangle" },
      medium: { variant: "medium", icon: "Clock" },
      low: { variant: "low", icon: "Circle" }
    };
    return badges[priority] || badges.medium;
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    
    return format(date, "MMM d");
  };

  const isDueToday = (dateString) => {
    if (!dateString) return false;
    return isToday(new Date(dateString));
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return isPast(new Date(dateString)) && !isToday(new Date(dateString));
  };

  const priorityBadge = getPriorityBadge(task.priority);
  const dueDateText = formatDueDate(task.dueDate);
  
return (
    <div>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        whileHover={{ y: -2 }}
        className={`bg-white rounded-lg p-4 task-card-shadow hover:task-card-shadow-hover transition-all duration-200 ${
          task.completed ? "opacity-75" : ""
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className="pt-1">
            <Checkbox
              checked={task.completed}
              onChange={() => onToggleComplete(task.Id)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`font-semibold text-gray-900 ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-sm text-gray-600 mt-1 ${
                    task.completed ? "line-through" : ""
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Badge variant={priorityBadge.variant} size="sm">
                  <ApperIcon 
                    name={priorityBadge.icon} 
                    size={12} 
                    className="mr-1" 
                  />
                  {task.priority}
                </Badge>

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="p-1.5"
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.Id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <span 
                  className="category-tag text-xs"
                  style={{ 
                    backgroundColor: `rgba(124, 58, 237, 0.1)`,
                    color: "#7C3AED"
                  }}
                >
                  {task.category}
                </span>
                
                {subtasks.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 h-6 w-6"
                    >
                      <ApperIcon 
                        name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                        size={12} 
                      />
                    </Button>
                    <span className="text-xs text-gray-500">
                      {subtasks.filter(s => s.completed).length}/{subtasks.length} subtasks
                    </span>
                  </div>
                )}
              </div>

              {dueDateText && (
                <div className={`flex items-center space-x-1 text-xs ${
                  isOverdue(task.dueDate)
                    ? "text-red-600"
                    : isDueToday(task.dueDate)
                    ? "text-amber-600"
                    : "text-gray-500"
                }`}>
                  <ApperIcon 
                    name={isOverdue(task.dueDate) ? "AlertCircle" : "Calendar"} 
                    size={12} 
                  />
                  <span>{dueDateText}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="p-2"
                >
                  <ApperIcon name="Edit2" size={14} />
                </Button>
                
                {onCreateSubtask && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateSubtask(task)}
                    className="p-2"
                    title="Add Subtask"
                  >
                    <ApperIcon name="Plus" size={14} />
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.Id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtasks */}
      {subtasks.length > 0 && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 ml-8 space-y-2"
        >
          {subtasks.map((subtask) => (
            <motion.div
              key={subtask.Id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-gray-50 rounded-lg p-3 border-l-2 border-blue-200 relative ${
                subtask.completed ? "opacity-75" : ""
              }`}
            >
              {/* Connecting line */}
              <div className="absolute -left-8 top-0 bottom-0 w-8 flex items-start justify-center pt-4">
                <div className="w-4 h-px bg-gray-300"></div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={subtask.completed}
                  onChange={() => onToggleComplete(subtask.Id)}
                  className="mt-0.5"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${
                    subtask.completed 
                      ? "line-through text-gray-500" 
                      : "text-gray-900"
                  }`}>
                    {subtask.title}
                  </h4>
                  
                  {subtask.description && (
                    <p className={`text-xs mt-1 ${
                      subtask.completed ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {subtask.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          subtask.priority === "high" ? "destructive" :
                          subtask.priority === "medium" ? "warning" : "secondary"
                        }
                        className="text-xs px-2 py-0.5"
                      >
                        {subtask.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(subtask)}
                        className="p-1 h-6 w-6 text-gray-500 hover:text-gray-700"
                      >
                        <ApperIcon name="Edit2" size={12} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(subtask.Id)}
                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TaskCard;