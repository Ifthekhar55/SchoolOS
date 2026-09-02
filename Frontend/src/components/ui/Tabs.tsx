import React from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div>{children}</div>
  </TabsContext.Provider>
);

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div role="tablist" className={`flex gap-1 rounded-lg bg-slate-100 p-1 ${className}`} {...props}>
    {children}
  </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '', ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used inside Tabs');
  const active = context.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => context.onValueChange(value)}
      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used inside Tabs');
  return context.value === value ? <div role="tabpanel">{children}</div> : null;
};
