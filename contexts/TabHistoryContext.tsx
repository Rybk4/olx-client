// contexts/TabHistoryContext.tsx
import React, { createContext, useContext, useState } from "react";

interface TabHistoryContextType {
  tabHistory: string[];
  addTabToHistory: (tab: string) => void;
}

const TabHistoryContext = createContext<TabHistoryContextType | undefined>(undefined);

export const TabHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabHistory, setTabHistory] = useState<string[]>(["index"]); // Изначально главная вкладка

  const addTabToHistory = (tab: string) => {
    setTabHistory((prev) => {
      const newHistory = prev.filter((t) => t !== tab); // Удаляем дубликат, если есть
      newHistory.push(tab); // Добавляем новую вкладку в конец
      return newHistory;
    });
  };

  return (
    <TabHistoryContext.Provider value={{ tabHistory, addTabToHistory }}>
      {children}
    </TabHistoryContext.Provider>
  );
};

export const useTabHistory = () => {
  const context = useContext(TabHistoryContext);
  if (!context) throw new Error("useTabHistory must be used within a TabHistoryProvider");
  return context;
};