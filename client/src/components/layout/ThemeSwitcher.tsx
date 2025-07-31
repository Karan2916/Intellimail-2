import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { SunIcon, MoonIcon } from '../common/Icons';
import { Theme } from '../../types';

const ThemeButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`w-full p-2 rounded-lg transition-colors flex justify-center items-center ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-500 hover:bg-slate-200/80 dark:text-gray-400 dark:hover:bg-gray-700/50'
    }`}
  >
    {icon}
  </button>
);

export const ThemeSwitcher: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }
  const { theme, setTheme } = context;

  const themes: { name: Theme; icon: React.ReactNode; label: string }[] = [
    { name: 'light', icon: <SunIcon className="w-5 h-5" />, label: 'Light Mode' },
    { name: 'dark', icon: <MoonIcon className="w-5 h-5" />, label: 'Dark Mode' },
  ];

  return (
    <div className="p-1 bg-slate-200/50 dark:bg-gray-900/40 rounded-xl grid grid-cols-2 gap-1">
      {themes.map((t) => (
        <ThemeButton
          key={t.name}
          label={t.label}
          icon={t.icon}
          isActive={theme === t.name}
          onClick={() => setTheme(t.name)}
        />
      ))}
    </div>
  );
};