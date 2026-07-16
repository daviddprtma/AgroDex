import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface IconCardProps {
  label: string;
  emoji?: string;
  icon?: LucideIcon;
  to?: string;
  onClick?: () => void;
  ariaLabel?: string;
  colorClass?: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
  };
}

export const IconCard: React.FC<IconCardProps> = ({
  label,
  emoji,
  icon: Icon,
  to,
  onClick,
  ariaLabel,
  colorClass = {
    bg: "from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900/60",
    border: "border-emerald-100 dark:border-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
}) => {
  const finalAriaLabel = ariaLabel || label;

  const cardContent = (
    <div className="flex flex-col items-center justify-center p-6 h-full w-full text-center">
      {/* Icon Area */}
      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${colorClass.iconBg} shadow-inner`}>
        {Icon ? (
          <Icon className={`h-8 w-8 ${colorClass.text}`} />
        ) : (
          <span className="text-4xl select-none" role="img" aria-hidden="true">
            {emoji}
          </span>
        )}
      </div>

      {/* Label */}
      <span className="text-lg sm:text-xl font-bold tracking-tight leading-snug">
        {label}
      </span>
    </div>
  );

  const classes = `block w-full h-full text-left rounded-3xl border-2 ${colorClass.border} bg-gradient-to-br ${colorClass.bg} shadow-md hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all cursor-pointer min-h-[140px]`;

  if (to) {
    return (
      <motion.div
        className="h-full"
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Link to={to} className={classes} aria-label={finalAriaLabel}>
          {cardContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full"
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <button
        type="button"
        onClick={onClick}
        className={classes}
        aria-label={finalAriaLabel}
      >
        {cardContent}
      </button>
    </motion.div>
  );
};

export default IconCard;
