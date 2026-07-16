import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface AccessibilityContextType {
  accessibilityMode: boolean;
  toggleAccessibility: () => void;
  toggle: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('agrodex_accessibility_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agrodex_accessibility_mode', String(accessibilityMode));
    } catch (e) {
      console.error('Failed to save accessibility mode preference', e);
    }
  }, [accessibilityMode]);

  const toggleAccessibility = useCallback(() => {
    setAccessibilityMode((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      accessibilityMode,
      toggleAccessibility,
      toggle: toggleAccessibility,
    }),
    [accessibilityMode, toggleAccessibility]
  );

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};
