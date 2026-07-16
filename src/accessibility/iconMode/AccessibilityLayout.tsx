import React from "react";
import { useAccessibility } from "./useAccessibility";
import { useTranslation } from "react-i18next";
import { NavigationGrid } from "./NavigationGrid";
import { Compass } from "lucide-react";

interface AccessibilityLayoutProps {
  children: React.ReactNode;
  showShortcuts?: boolean;
}

export const AccessibilityLayout: React.FC<AccessibilityLayoutProps> = ({
  children,
  showShortcuts = true,
}) => {
  const { accessibilityMode } = useAccessibility();
  const { i18n } = useTranslation();

  const isIndonesian = i18n.language?.startsWith("id");

  if (!accessibilityMode) {
    return <>{children}</>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950/20 transition-all duration-300">
      <div className="container mx-auto px-6 py-8 md:py-12 space-y-8 md:space-y-12">
        {/* Quick Access Grid Section */}
        {showShortcuts && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-emerald-100/80 dark:border-emerald-950/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-950/50 p-2.5 rounded-2xl">
                <Compass className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {isIndonesian ? "Menu Pintasan" : "Quick Actions"}
                </h2>
                <p className="text-sm font-medium text-slate-550 dark:text-slate-400">
                  {isIndonesian 
                    ? "Gunakan tombol besar di bawah ini untuk mengakses halaman dengan mudah." 
                    : "Use the large buttons below to navigate and verify products easily."}
                </p>
              </div>
            </div>

            <NavigationGrid />
          </div>
        )}

        {/* Child content with increased spacing/padding */}
        <div className="accessibility-mode-content space-y-8 md:space-y-12 select-none-elements-override">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityLayout;
