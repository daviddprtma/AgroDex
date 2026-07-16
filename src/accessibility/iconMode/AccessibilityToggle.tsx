import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "./useAccessibility";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export function AccessibilityToggle() {
  const { accessibilityMode, toggle } = useAccessibility();
  const { i18n } = useTranslation();

  const isIndonesian = i18n.language?.startsWith("id");

  const label = isIndonesian
    ? (accessibilityMode ? "Matikan Mode Ikon" : "Aktifkan Mode Ikon")
    : (accessibilityMode ? "Disable Icon Mode" : "Enable Icon Mode");

  const tooltipText = isIndonesian
    ? "Mode Ikon & Navigasi Mudah (Aksesibilitas)"
    : "Icon Mode & Easy Navigation (Accessibility)";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`relative h-9 w-9 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        accessibilityMode
          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900"
          : "text-gray-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
      }`}
      aria-pressed={accessibilityMode}
      aria-label={label}
      title={tooltipText}
    >
      <motion.div
        animate={{ scale: accessibilityMode ? 1.15 : 1, rotate: accessibilityMode ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
      </motion.div>
      <span className="sr-only">{label}</span>
    </Button>
  );
}

export default AccessibilityToggle;
