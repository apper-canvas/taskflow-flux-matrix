import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Task input skeleton */}
      <div className="bg-white rounded-lg p-6 space-y-4 task-card-shadow">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="flex space-x-4">
        <div className="h-10 bg-gray-200 rounded w-48"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Task list skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 space-y-3 task-card-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Loading;