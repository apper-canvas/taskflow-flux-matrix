import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md mx-auto px-4"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-primary-100 to-purple-100 rounded-full w-32 h-32 mx-auto flex items-center justify-center"
          >
            <ApperIcon name="FileQuestion" size={64} className="text-primary-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900">
              Page Not Found
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8 py-3"
          >
            <ApperIcon name="Home" size={16} className="mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
            >
              <ApperIcon name="ArrowLeft" size={14} />
              <span>Go Back</span>
            </button>
            
            <span>•</span>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
            >
              <ApperIcon name="RefreshCw" size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-100"
        >
          <div className="flex items-center space-x-3">
            <ApperIcon name="Lightbulb" size={20} className="text-primary-500" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Helpful Suggestion</h3>
              <p className="text-sm text-gray-600 mt-1">
                Try going back to your task list to continue managing your productivity.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;