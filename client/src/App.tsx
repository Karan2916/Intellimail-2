// client/src/App.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppContext } from './state/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer'; // <-- Import Footer
import { InboxPage } from './pages/InboxPage';
import { SummaryPage } from './pages/SummaryPage';
import { ComposePage } from './pages/ComposePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy'; // <-- Import PrivacyPolicy
import { TermsOfService } from './pages/TermsOfService'; // <-- Import TermsOfService
import { fetchGmailEmails, getUserInfo } from './api/googleApiService';
import type { Email, UserInfo, ActiveView, Theme } from './types';
import { ActiveView as ActiveViewEnum } from './types';
import { Spinner } from './components/common/Icons';
import { Alert } from './components/common/Alert';
import { GOOGLE_CLIENT_ID } from './config';

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

    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
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

  // --- This function is now updated ---
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
      case ActiveViewEnum.PRIVACY:
        return <PrivacyPolicy />;
      case ActiveViewEnum.TERMS:
        return <TermsOfService />;
      default:
        return <InboxPage />;
    }
  };

  const renderContent = () => {
    if (isAppLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-10 h-10" />
        </div>
      );
    }

    if (!areKeysConfigured) {
        return <Alert />;
    }

    return accessToken ? (
      <div className="flex flex-col h-full w-full"> {/* <-- Changed to flex-col */}
        <div className="flex flex-1 overflow-hidden relative"> {/* <-- New wrapper */}
          <Sidebar />
          <main className="flex-1 flex flex-col h-full dark:bg-grid-slate-700/[0.2]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {renderActiveView()}
            </div>
          </main>
        </div>
        <Footer /> {/* <-- Add Footer here */}
      </div>
    ) : (
      <LoginPage />
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContext.Provider value={appContextValue}>
        <div className="h-screen w-full font-sans overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-50 -translate-x-1/4 -translate-y-1/4"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 translate-x-1/4 translate-y-1/4"></div>
          </div>
          {renderContent()}
        </div>
      </AppContext.Provider>
    </GoogleOAuthProvider>
  );
}
