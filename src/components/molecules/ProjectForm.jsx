import { useState } from "react";
import { motion } from "framer-motion";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const ProjectForm = ({ onSubmit, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    status: initialData?.status || "planning",
    priority: initialData?.priority || "medium",
    startDate: initialData?.startDate || format(new Date(), "yyyy-MM-dd"),
    dueDate: initialData?.dueDate || "",
    color: initialData?.color || "#4F46E5",
    progress: initialData?.progress || 0
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (formData.name.length > 100) {
      newErrors.name = "Project name must be less than 100 characters";
    }

    if (formData.dueDate && formData.startDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
      newErrors.dueDate = "Due date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const projectData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      progress: parseInt(formData.progress),
      dueDate: formData.dueDate || null
    };

    onSubmit(projectData);
    
    if (!initialData) {
      // Reset form for new projects
      setFormData({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        startDate: format(new Date(), "yyyy-MM-dd"),
        dueDate: "",
        color: "#4F46E5",
        progress: 0
      });
    }
    
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getTodayDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  const colorOptions = [
    { value: "#4F46E5", label: "Blue" },
    { value: "#7C3AED", label: "Purple" },
    { value: "#F59E0B", label: "Amber" },
    { value: "#EF4444", label: "Red" },
    { value: "#10B981", label: "Emerald" },
    { value: "#8B5CF6", label: "Violet" },
    { value: "#EC4899", label: "Pink" },
    { value: "#06B6D4", label: "Cyan" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 task-card-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? "Edit Project" : "Create New Project"}
        </h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <ApperIcon name="X" size={16} />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter project name"
          error={errors.name}
          maxLength={100}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your project goals and objectives..."
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </Select>

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </Select>

          <Select
            label="Color"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
          >
            {colorOptions.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            label="Progress (%)"
            value={formData.progress}
            onChange={(e) => handleChange("progress", e.target.value)}
            min={0}
            max={100}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            max={formData.dueDate || undefined}
          />

          <Input
            type="date"
            label="Due Date (Optional)"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            min={formData.startDate || getTodayDate()}
            error={errors.dueDate}
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={!formData.name.trim()}
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            {initialData ? "Update Project" : "Create Project"}
          </Button>
          
          {onClose && (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default ProjectForm;