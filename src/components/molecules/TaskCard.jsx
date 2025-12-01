import { motion } from "framer-motion";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import Checkbox from "@/components/atoms/Checkbox";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
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
            <span 
              className="category-tag text-xs"
              style={{ 
                backgroundColor: `rgba(124, 58, 237, 0.1)`,
                color: "#7C3AED"
              }}
            >
              {task.category}
            </span>

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
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;