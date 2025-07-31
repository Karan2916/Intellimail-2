

import React from 'react';

export const Alert: React.FC = () => (
    <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-left bg-yellow-900/50 p-8 rounded-2xl border border-yellow-500 max-w-3xl z-10 shadow-lg prose prose-invert prose-sm">
            <h1 className="text-2xl font-bold text-white mb-4">Configuration Required</h1>
            <p className="text-yellow-200 mb-6">
                Welcome to IntelliMail! To get started, you need to configure your Google Client ID for the frontend and your Gemini API key for the backend server.
            </p>
            
            <h2 className="text-lg font-bold text-white mt-6 mb-3">Follow these steps:</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-300">
                <li>
                    <strong>Configure your Google Client ID (Frontend):</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 text-gray-400 space-y-2">
                        <li>Visit the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google API Console</a>.</li>
                        <li>Create an "OAuth 2.0 Client ID" with the type "Web application".</li>
                        <li>
                            For local development, create a file named <code className="bg-gray-700 p-1 rounded">.env.local</code> in the <code className="bg-gray-700 p-1 rounded">client/</code> directory.
                        </li>
                        <li>Add your Client ID to that file like this (the `VITE_` prefix is important):<br/>
                            <code className="bg-gray-700/80 p-1.5 rounded text-sm mt-1 inline-block">VITE_GOOGLE_CLIENT_ID='YOUR_CLIENT_ID_HERE'</code>
                        </li>
                    </ul>
                </li>
                <li>
                    <strong>Set your Gemini API Key (Backend):</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 text-gray-400 space-y-2">
                        <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a> to create a new API key.</li>
                        <li>The server reads this key from an environment variable named <code className="bg-gray-700 p-1 rounded">GEMINI_API_KEY</code>.</li>
                        <li>
                            How you set this variable depends on your hosting environment. If running locally, you can create a <code className="bg-gray-700 p-1 rounded">.env</code> file in the <code className="bg-gray-700 p-1 rounded">server/</code> directory and add the line: <br/> 
                            <code className="bg-gray-700/80 p-1.5 rounded text-sm mt-1 inline-block">GEMINI_API_KEY='YOUR_API_KEY_HERE'</code>
                        </li>
                        <li>You may need to restart the server for it to pick up the new environment variable.</li>
                    </ul>
                </li>
            </ol>
            
            <div className="mt-8 flex items-center gap-4 bg-black/20 p-4 rounded-lg">
              <p className="text-yellow-300 font-semibold">After saving your keys and restarting the server if needed, refresh this page.</p>
              <button onClick={() => window.location.reload()} className="ml-auto flex-shrink-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Refresh Page
              </button>
            </div>
        </div>
    </div>
);
