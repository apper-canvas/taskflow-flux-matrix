import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Checkbox = forwardRef(({
  className,
  checked,
  onChange,
  disabled,
  ...props
}, ref) => {
  return (
    <motion.label
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className="relative cursor-pointer"
    >
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
          checked
            ? "bg-primary-500 border-primary-500"
            : "bg-white border-gray-300 hover:border-primary-300",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ApperIcon name="Check" size={12} className="text-white" />
          </motion.div>
        )}
      </div>
    </motion.label>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;