import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isToday, isPast, startOfDay, endOfDay, addWeeks, subWeeks, addMonths, subMonths, startOfWeek as getStartOfWeek, endOfWeek as getEndOfWeek } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { taskService } from '@/services/api/taskService';

const CalendarView = ({ tasks, onTaskEdit, onTaskUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week', 'day'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const calendarViews = [
    { key: 'month', label: 'Month', icon: 'Calendar' },
    { key: 'week', label: 'Week', icon: 'CalendarDays' },
    { key: 'day', label: 'Day', icon: 'Clock' }
  ];

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  const getTaskStatusColor = (task) => {
    if (task.completed) return 'bg-green-500';
    if (isPast(new Date(task.dueDate)) && !task.completed) return 'bg-red-500';
    if (task.priority === 'high') return 'bg-red-400';
    if (task.priority === 'medium') return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleDateNavigation = (direction) => {
    if (calendarView === 'month') {
      setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1));
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
            {dayName}
          </div>
        ))}
        
        {/* Days */}
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}
              `}
              onClick={() => {
                setCurrentDate(day);
                setCalendarView('day');
              }}
            >
              <div className={`text-sm font-medium mb-1 ${isDayToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              
              {/* Task indicators */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <motion.div
                    key={task.Id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
                      w-full h-1.5 rounded-full cursor-pointer hover:h-2 transition-all
                      ${getTaskStatusColor(task)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                    title={task.title}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getStartOfWeek(currentDate);
    const weekEnd = getEndOfWeek(currentDate);
    const days = [];
    let day = weekStart;

    while (day <= weekEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1 h-96">
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isDayToday = isToday(day);
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                ${isDayToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}
              `}
              onClick={() => {
                setCurrentDate(day);
                setCalendarView('day');
              }}
            >
              <div className={`text-sm font-medium mb-2 ${isDayToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'EEE d')}
              </div>
              
              <div className="space-y-1 overflow-y-auto h-full">
                {dayTasks.map(task => (
                  <motion.div
                    key={task.Id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
                      p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all
                      ${getTaskStatusColor(task)} text-white
                      ${task.completed ? 'opacity-70 line-through' : ''}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    {task.dueDate && (
                      <div className="opacity-80">
                        {format(new Date(task.dueDate), 'h:mm a')}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="max-h-96 overflow-y-auto">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        {dayTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ApperIcon name="CalendarDays" size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No tasks scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map(task => (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all
                  ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}
                  ${isPast(new Date(task.dueDate)) && !task.completed ? 'border-red-300 bg-red-50' : ''}
                `}
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <ApperIcon name="Clock" size={12} className="mr-1" />
                          {format(new Date(task.dueDate), 'h:mm a')}
                        </span>
                      )}
                      <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-4">
                    {task.completed ? (
                      <ApperIcon name="CheckCircle" size={20} className="text-green-500" />
                    ) : isPast(new Date(task.dueDate)) ? (
                      <ApperIcon name="AlertCircle" size={20} className="text-red-500" />
                    ) : (
                      <ApperIcon name="Circle" size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Calendar View Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {calendarViews.map(view => (
              <Button
                key={view.key}
                variant={calendarView === view.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCalendarView(view.key)}
                className="flex items-center space-x-1"
              >
                <ApperIcon name={view.icon} size={14} />
                <span>{view.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-blue-600"
          >
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateNavigation('prev')}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <h3 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {calendarView === 'month' && format(currentDate, 'MMMM yyyy')}
              {calendarView === 'week' && `${format(getStartOfWeek(currentDate), 'MMM d')} - ${format(getEndOfWeek(currentDate), 'MMM d, yyyy')}`}
              {calendarView === 'day' && format(currentDate, 'MMMM d, yyyy')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateNavigation('next')}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={calendarView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {calendarView === 'month' && renderMonthView()}
            {calendarView === 'week' && renderWeekView()}
            {calendarView === 'day' && renderDayView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showTaskDetail && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTaskDetail(false)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className={`mt-1 text-gray-900 ${selectedTask.completed ? 'line-through' : ''}`}>
                    {selectedTask.title}
                  </p>
                </div>

                {selectedTask.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-600">{selectedTask.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <div className="mt-1">
                      <Badge variant={selectedTask.priority === 'high' ? 'destructive' : selectedTask.priority === 'medium' ? 'warning' : 'secondary'}>
                        {selectedTask.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant={selectedTask.completed ? 'secondary' : isPast(new Date(selectedTask.dueDate)) ? 'destructive' : 'secondary'}>
                        {selectedTask.completed ? 'Completed' : isPast(new Date(selectedTask.dueDate)) ? 'Overdue' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedTask.dueDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <p className="mt-1 text-gray-600">
                      {format(new Date(selectedTask.dueDate), 'PPP p')}
                    </p>
                  </div>
                )}

                {selectedTask.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-gray-600">{selectedTask.category}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t">
                <Button
                  variant="primary"
                  onClick={() => {
                    onTaskEdit(selectedTask);
                    setShowTaskDetail(false);
                  }}
                  className="flex-1"
                >
                  Edit Task
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowTaskDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;