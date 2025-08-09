import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { Theme } from '../../types';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';

export const ThemeSwitcher: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }
  const { theme, setTheme } = context;

  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTheme: Theme | null,
  ) => {
    if (newTheme !== null) {
      setTheme(newTheme);
    }
  };

  return (
    <ToggleButtonGroup
      value={theme}
      exclusive
      onChange={handleThemeChange}
      aria-label="Theme"
      fullWidth
    >
      <ToggleButton value="light" aria-label="Light Mode">
        <LightMode />
      </ToggleButton>
      <ToggleButton value="dark" aria-label="Dark Mode">
        <DarkMode />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};