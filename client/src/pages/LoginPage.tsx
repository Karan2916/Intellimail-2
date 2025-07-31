
import React, { useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AppContext } from '../state/AppContext';
import { AppLogoIcon } from '../components/common/Icons';

const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const LoginPage: React.FC = () => {
  const context = useContext(AppContext);
  const [authFailed, setAuthFailed] = useState(false);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);
  
  const handleCopyOrigin = () => {
    if (origin) {
        navigator.clipboard.writeText(origin).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy origin to clipboard', err);
        });
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      context?.login(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      // The 'invalid_request' error is a key indicator of a configuration problem.
      setAuthFailed(true);
    },
    scope: GMAIL_SCOPES,
  });

  if (authFailed) {
    return (
        <div className="h-screen w-full font-sans overflow-auto flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-50 -translate-x-1/4 -translate-y-1/4"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 translate-x-1/4 translate-y-1/4"></div>
            </div>
            <div className="text-left bg-red-900/50 p-8 rounded-2xl border border-red-500 max-w-3xl z-10 shadow-lg prose prose-invert prose-sm">
                <h1 className="text-2xl font-bold text-white mb-4">Access Blocked: Authorization Error (invalid_request)</h1>
                <p className="text-red-200 mb-6">
                    This error means your Google Cloud project's OAuth configuration doesn't trust this application's URL. Let's fix it by ensuring the correct URIs are authorized.
                </p>
                
                <h2 className="text-lg font-bold text-white mt-6 mb-3">Step 1: Check Your Client ID & API Settings</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>In the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google API Console</a>, make sure your OAuth Client ID is for a <code className="bg-gray-700 p-1 rounded">Web application</code>.</li>
                    <li>Ensure the <a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Gmail API</a> is enabled for your project.</li>
                </ul>

                <h2 className="text-lg font-bold text-white mt-8 mb-3">Step 2: Add Authorized JavaScript Origin (Crucial)</h2>
                <p className="text-red-200 mb-3">This tells Google which domains can initiate a login request. It must be an <strong className="text-white">exact match</strong> to your app's URL origin (the part before the path).</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Go to your <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OAuth Client ID settings</a>.</li>
                    <li>Under <strong>Authorized JavaScript origins</strong>, click <strong>+ ADD URI</strong>.</li>
                    <li>Add the following URI, which is your application's current origin:</li>
                </ol>
                <div className="my-3 flex items-center gap-3">
                    <code className="bg-gray-700 p-2 text-white font-mono inline-block rounded w-full border border-gray-500">{origin || 'Loading...'}</code>
                    <button onClick={handleCopyOrigin} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-xs font-semibold rounded-lg transition-colors w-24">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>


                <h2 className="text-lg font-bold text-white mt-8 mb-3">Step 3: Add Authorized Redirect URI (Common Pitfall)</h2>
                 <p className="text-red-200 mb-3">
                    This list tells Google the URLs where it is allowed to send users after they log in. For client-side web apps, it's crucial that this list contains your app's origin.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>In the same OAuth settings, find <strong>Authorized redirect URIs</strong> and click <strong>+ ADD URI</strong>.</li>
                    <li>
                      Add your app's origin here as well: <code className="bg-gray-700 p-1 rounded">{origin || 'Loading...'}</code>
                    </li>
                    <li>
                      <strong>Note:</strong> You might see an existing URI like <code className="bg-gray-600 p-1 rounded">https://accounts.google.com/gsi/client</code>. This is used by Google's Sign-In library and should be left in place. The most important action is to ensure your app's origin URI is also on this list.
                    </li>
                </ol>

                <h2 className="text-lg font-bold text-white mt-8 mb-3">Step 4: Add Test Users</h2>
                <p className="text-red-200 mb-3">While your app is in "Testing" mode, only approved email addresses can log in.</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OAuth consent screen</a>.</li>
                    <li>Under <strong>Test users</strong>, click <strong>+ ADD USERS</strong> and add the Google account you wish to log in with.</li>
                </ol>
                
                <div className="mt-8 flex items-center gap-4 bg-black/20 p-4 rounded-lg">
                  <p className="text-yellow-300 font-semibold">After completing all steps, refresh the page to try again.</p>
                  <button onClick={() => window.location.reload()} className="ml-auto flex-shrink-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                      Refresh Page
                  </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative dark:bg-grid-slate-700/[0.2]">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-2xl border border-slate-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-2xl text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-blue-500/20 rounded-full mb-4">
              <AppLogoIcon className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to IntelliMail</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-2">Sign in with your Google account to continue.</p>
          </div>

          <button
            onClick={() => handleGoogleLogin()}
            className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Sign in with Google
          </button>
          
          <p className="mt-6 text-center text-xs text-slate-500 dark:text-gray-500">
            By signing in, you grant IntelliMail permission to read and send emails on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
};
