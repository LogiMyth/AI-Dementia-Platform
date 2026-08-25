import React from "react";

export type TabKey = "today" | "routines" | "checkin" | "memories" | "companion" | "settings";

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "today", label: "Today", icon: "🏠" },
    { key: "routines", label: "Routines", icon: "📋" },
    { key: "checkin", label: "Check-in", icon: "💖" },
    { key: "memories", label: "Memories", icon: "📸" },
    { key: "companion", label: "Companion", icon: "💬" },
    { key: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => onSelectTab(tab.key)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
