import React from 'react';
import { BarChart3, Cloud, Sprout, TrendingUp, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isMobileMenuOpen }) => {
  const { t } = useLanguage();

  const navigation = [
    {
      id: 'dashboard',
      name: t('dashboard'),
      icon: BarChart3,
      current: activeTab === 'dashboard'
    },
    {
      id: 'crop-data',
      name: t('cropData'),
      icon: Sprout,
      current: activeTab === 'crop-data'
    },
    {
      id: 'climate-data',
      name: t('climateData'),
      icon: Cloud,
      current: activeTab === 'climate-data'
    },
    {
      id: 'predictions',
      name: t('predictions'),
      icon: TrendingUp,
      current: activeTab === 'predictions'
    },
    {
      id: 'profile',
      name: t('profile'),
      icon: User,
      current: activeTab === 'profile'
    }
  ];

  return (
    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
      <div className="md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 pt-16 md:pt-0">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`
                      ${item.current
                        ? 'bg-green-100 text-green-900'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full
                    `}
                  >
                    <Icon
                      className={`
                        ${item.current ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                        mr-3 flex-shrink-0 h-6 w-6
                      `}
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;