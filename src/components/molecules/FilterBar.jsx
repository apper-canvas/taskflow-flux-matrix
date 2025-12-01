import { motion } from "framer-motion";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FilterBar = ({ 
  activeFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange,
  taskCounts = { all: 0, active: 0, completed: 0 },
  activeView,
  onViewChange,
  showViewToggle = false
}) => {
  const filters = [
    { 
      key: "all", 
      label: `All (${taskCounts.all})`, 
      icon: "List" 
    },
    { 
      key: "active", 
      label: `Active (${taskCounts.active})`, 
      icon: "Circle" 
    },
    { 
      key: "completed", 
      label: `Completed (${taskCounts.completed})`, 
      icon: "CheckCircle2" 
    }
  ];

  const views = [
    { key: 'list', label: 'List', icon: 'List' },
    { key: 'kanban', label: 'Kanban', icon: 'Kanban' },
    { key: 'calendar', label: 'Calendar', icon: 'Calendar' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-4 task-card-shadow space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "primary" : "ghost"}
              size="sm"
              onClick={() => onFilterChange(filter.key)}
              className={`flex items-center space-x-2 ${
                activeFilter === filter.key ? "" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ApperIcon name={filter.icon} size={14} />
              <span>{filter.label}</span>
            </Button>
          ))}
        </div>

        {/* View Toggle (if enabled) */}
        {showViewToggle && onViewChange && (
          <div className="flex space-x-2">
            {views.map((view) => (
              <Button
                key={view.key}
                variant={activeView === view.key ? "primary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(view.key)}
                className="flex items-center space-x-2"
                disabled={view.key === 'calendar'}
              >
                <ApperIcon name={view.icon} size={14} />
                <span className="hidden sm:inline">{view.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <ApperIcon name="Search" size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;