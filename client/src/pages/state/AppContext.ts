
import React, { createContext } from 'react';
import type { Email, ActiveView, UserInfo, Theme } from '../types';

interface IAppContext {
  emails: Email[];
  selectedEmail: Email | null;
  setSelectedEmail: React.Dispatch<React.SetStateAction<Email | null>>;
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  
  userInfo: UserInfo | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isFetchingEmails: boolean;
  areKeysConfigured: boolean;
  login: (token: string) => void;
  logout: () => void;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const AppContext = createContext<IAppContext | null>(null);