


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppContext } from './state/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { InboxPage } from './pages/InboxPage';
import { SummaryPage } from './pages/SummaryPage';
import { ComposePage } from './pages/ComposePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { fetchGmailEmails, getUserInfo } from './api/googleApiService';
import type { Email, UserInfo, ActiveView, Theme } from './types';
import { ActiveView as ActiveViewEnum } from './types';
import { GOOGLE_CLIENT_ID } from './config';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import lightTheme, { darkTheme } from './theme';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(ActiveViewEnum.INBOX);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isFetchingEmails, setIsFetchingEmails] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme;
      return storedTheme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  const areKeysConfigured = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLoginSuccess = useCallback(async (token: string) => {
    sessionStorage.setItem('gmail_access_token', token);
    setAccessToken(token);
    setIsFetchingEmails(true);
    try {
      const user = await getUserInfo(token);
      setUserInfo(user);
      const fetchedEmails = await fetchGmailEmails(token);
      setEmails(fetchedEmails);
      if (fetchedEmails.length > 0) {
        setSelectedEmail(fetchedEmails[0]);
      }
    } catch (error) {
      console.error("Failed to fetch user data or emails:", error);
      handleLogout(); // Log out if there's an error
    } finally {
      setIsFetchingEmails(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('gmail_access_token');
    setAccessToken(null);
    setUserInfo(null);
    setEmails([]);
    setSelectedEmail(null);
    setActiveView(ActiveViewEnum.INBOX);
  };
  
  useEffect(() => {
    const storedToken = sessionStorage.getItem('gmail_access_token');
    if (storedToken && areKeysConfigured) {
      handleLoginSuccess(storedToken);
    }
    setIsAppLoading(false);
  }, [handleLoginSuccess, areKeysConfigured]);


  const appContextValue = useMemo(() => ({
    emails,
    selectedEmail,
    setSelectedEmail,
    activeView,
    setActiveView,
    userInfo,
    accessToken,
    login: handleLoginSuccess,
    logout: handleLogout,
    isFetchingEmails,
    areKeysConfigured,
    theme,
    setTheme
  }), [emails, selectedEmail, activeView, userInfo, accessToken, handleLoginSuccess, isFetchingEmails, areKeysConfigured, theme]);

  const renderActiveView = () => {
    switch (activeView) {
      case ActiveViewEnum.INBOX:
        return <InboxPage />;
      case ActiveViewEnum.SUMMARY:
        return <SummaryPage />;
      case ActiveViewEnum.COMPOSE:
        return <ComposePage />;
      case ActiveViewEnum.SEARCH:
        return <SearchPage />;
      default:
        return <InboxPage />;
    }
  };

  const renderContent = () => {
    if (isAppLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!areKeysConfigured) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography color="error">Google Client ID is not configured. Please check the documentation.</Typography>
            </Box>
        );
    }

    return accessToken ? (
      <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
        <Sidebar />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
            {renderActiveView()}
          </Box>
        </Box>
      </Box>
    ) : (
      <LoginPage />
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContext.Provider value={appContextValue}>
        <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
          <CssBaseline />
          {renderContent()}
        </ThemeProvider>
      </AppContext.Provider>
    </GoogleOAuthProvider>
  );
}