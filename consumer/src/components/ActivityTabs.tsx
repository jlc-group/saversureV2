"use client";

interface Tab {
  key: string;
  label: string;
}

interface ActivityTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function ActivityTabs({ tabs, activeTab, onTabChange }: ActivityTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 -mx-4">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
              isActive
                ? "bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] text-white shadow-md shadow-green-200/40"
                : "bg-secondary text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
