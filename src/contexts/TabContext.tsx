import { type ReactNode, createContext, useContext, useState } from 'react'

interface TabContextType {
  activeTab: number
  setActiveTab: (index: number) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTabContext() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabProvider')
  }
  return context
}
