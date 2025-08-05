
import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { ActiveView } from '../../types';
import { InboxIcon, SparklesIcon, EditIcon, SearchIcon, LogOutIcon, AppLogoIcon, ShieldIcon } from '../common/Icons';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: ActiveView;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="mr-3">{icon}</div>
    <span>{label}</span>
  </button>
);

export const Sidebar: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) return null;
  const { activeView, setActiveView, userInfo, logout, selectedEmail } = context;

  const navItems = [
    { icon: <InboxIcon className="w-5 h-5" />, label: 'Inbox', view: ActiveView.INBOX, disabled: false },
    { icon: <SparklesIcon className="w-5 h-5" />, label: 'AI Summary', view: ActiveView.SUMMARY, disabled: !selectedEmail },
    { icon: <EditIcon className="w-5 h-5" />, label: 'Compose AI', view: ActiveView.COMPOSE, disabled: false },
    { icon: <SearchIcon className="w-5 h-5" />, label: 'Search', view: ActiveView.SEARCH, disabled: false },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-50/80 dark:bg-gray-800/50 backdrop-blur-xl border-r border-slate-200/80 dark:border-gray-700/50 p-4 flex flex-col z-10">
      <div className="flex items-center mb-8">
        <AppLogoIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-white">IntelliMail</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            view={item.view}
            isActive={activeView === item.view}
            onClick={() => setActiveView(item.view)}
            disabled={item.disabled}
          />
        ))}
      </nav>
      <div className="mt-auto space-y-4">
        <ThemeSwitcher />
        <div className="pt-4 border-t border-slate-200/80 dark:border-gray-700/50">
          <NavItem
            icon={<ShieldIcon className="w-5 h-5" />}
            label="Privacy Policy"
            view={ActiveView.PRIVACY}
            isActive={activeView === ActiveView.PRIVACY}
            onClick={() => setActiveView(ActiveView.PRIVACY)}
          />
          {userInfo && (
            <div className="flex items-center pt-4">
                <img src={userInfo.picture} alt="avatar" className="w-8 h-8 rounded-full" />
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={userInfo.name}>{userInfo.name}</p>
                </div>
                <button 
                  onClick={logout} 
                  className="ml-auto flex-shrink-0 p-2 rounded-md hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 dark:hover:bg-gray-700/50 dark:text-gray-400 dark:hover:text-white transition-colors" 
                  aria-label="Sign Out"
                  title="Sign Out"
                >
                    <LogOutIcon className="w-5 h-5" />
                </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};