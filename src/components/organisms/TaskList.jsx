import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "@/components/molecules/TaskCard";
import Empty from "@/components/ui/Empty";

const TaskList = ({ tasks, onToggleComplete, onEditTask, onDeleteTask, onCreateTask, onCreateSubtask }) => {
  if (!tasks.length) {
    return (
      <Empty
        title="No tasks found"
        message="Create your first task to get started with organizing your work and personal activities."
        actionText="Create Task"
        onAction={onCreateTask}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard
            key={task.Id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;