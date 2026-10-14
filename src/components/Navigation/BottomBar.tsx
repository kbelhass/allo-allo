import React from 'react';
import { Flame, PlaySquare, MessageCircle, Compass, User } from 'lucide-react';

export type TabType = 'swipe' | 'video' | 'messages' | 'discovery' | 'profile';

interface BottomBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadMessagesCount: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  onSelectTab,
  unreadMessagesCount,
}) => {
  const tabs = [
    {
      id: 'swipe' as TabType,
      label: 'Rencontres',
      icon: Flame,
      badge: null,
    },
    {
      id: 'video' as TabType,
      label: 'Vidéos & Lives',
      icon: PlaySquare,
      badge: 'LIVE',
      badgeColor: 'bg-rose-500 animate-pulse text-white',
    },
    {
      id: 'messages' as TabType,
      label: 'Messages',
      icon: MessageCircle,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount.toString() : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'discovery' as TabType,
      label: 'Explorer',
      icon: Compass,
      badge: null,
    },
    {
      id: 'profile' as TabType,
      label: 'Profil',
      icon: User,
      badge: null,
    },
  ];

  return (
    <nav className="w-full bg-[#0d1017]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around z-30 sticky bottom-0">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`bottom-nav-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-rose-500 font-semibold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <IconComponent
                className={`w-6 h-6 transition-transform ${
                  isActive ? 'stroke-[2.4] text-rose-500' : 'stroke-[1.8]'
                }`}
              />
              {tab.badge && (
                <span
                  className={`absolute -top-1.5 -right-2.5 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm ${
                    tab.badgeColor || 'bg-rose-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight ${
                isActive ? 'text-white font-bold' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
