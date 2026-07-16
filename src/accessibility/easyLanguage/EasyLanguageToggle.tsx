import { Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEasyLanguage } from "./useEasyLanguage";
import { motion } from "framer-motion";

export function EasyLanguageToggle() {
  const { easyMode, toggle, language } = useEasyLanguage();

  const label = language === "indonesian"
    ? (easyMode ? "Matikan Bahasa Sederhana" : "Aktifkan Bahasa Sederhana")
    : (easyMode ? "Disable Easy Wording" : "Enable Easy Wording");

  const tooltipText = language === "indonesian"
    ? "Bahasa Sederhana (Aksesibilitas)"
    : "Easy Wording (Accessibility)";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`relative h-9 w-9 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        easyMode
          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900"
          : "text-gray-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
      }`}
      aria-pressed={easyMode}
      aria-label={label}
      title={tooltipText}
    >
      <motion.div
        animate={{ scale: easyMode ? 1.15 : 1, rotate: easyMode ? 15 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Accessibility className="h-[1.2rem] w-[1.2rem]" />
      </motion.div>
      <span className="sr-only">{label}</span>
    </Button>
  );
}
export default EasyLanguageToggle;
