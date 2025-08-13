// client/src/components/layout/Sidebar.tsx

import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../state/AppContext';
import { InboxIcon, SparklesIcon, EditIcon, SearchIcon, LogOutIcon, AppLogoIcon } from '../common/Icons';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Sidebar: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;
  // We no longer need activeView or setActiveView from context for navigation
  const { userInfo, logout, selectedEmail } = context;

  // This function determines the styling for a link (active vs. inactive)
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
    }`;

  // This is the styling for a disabled link
  const disabledClass = 'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-gray-400 opacity-50 cursor-not-allowed';

  const navItems = [
    { path: '/', icon: <InboxIcon className="w-5 h-5" />, label: 'Inbox' },
    { path: '/summary', icon: <SparklesIcon className="w-5 h-5" />, label: 'AI Summary' },
    { path: '/compose', icon: <EditIcon className="w-5 h-5" />, label: 'Compose AI' },
    { path: '/search', icon: <SearchIcon className="w-5 h-5" />, label: 'Search' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-50/80 dark:bg-gray-800/50 backdrop-blur-xl border-r border-slate-200/80 dark:border-gray-700/50 p-4 flex flex-col z-10">
      <div className="flex items-center mb-8">
        <AppLogoIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-white">IntelliMail</h1>
      </div>

      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isDisabled = item.path === '/summary' && !selectedEmail;

          return isDisabled ? (
            <div key={item.path} className={disabledClass}>
              <div className="mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              // `end` ensures the Inbox link is only active on the exact "/" path
              end={item.path === '/'}
              className={navLinkClass}
            >
              <div className="mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <ThemeSwitcher />
        <div className="pt-4 border-t border-slate-200/80 dark:border-gray-700/50">
          {userInfo && (
            <div className="flex items-center">
              <img src={userInfo.picture} alt="avatar" className="w-8 h-8 rounded-full" />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={userInfo.name}>
                  {userInfo.name}
                </p>
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