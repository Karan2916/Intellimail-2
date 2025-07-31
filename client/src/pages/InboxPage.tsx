
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../state/AppContext';
import { type Email, ActiveView } from '../types';
import { PaperclipIcon, SparklesIcon, Spinner } from '../components/common/Icons';
import { sanitizeHtml } from '../utils/htmlSanitizer';
import { Avatar } from '../components/common/Avatar';

const EmailListItem: React.FC<{ email: Email; isSelected: boolean; onClick: () => void; }> = ({ email, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 border-l-4 transition-all duration-200 ${
      isSelected
        ? 'bg-blue-200/50 dark:bg-gray-700/50 border-blue-400'
        : 'border-transparent hover:bg-slate-200/60 dark:hover:bg-gray-800/60'
    }`}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center min-w-0">
         <Avatar name={email.sender} className="w-10 h-10 mr-3" />
         <div className="min-w-0">
            <p className={`font-bold truncate ${email.isRead ? 'text-slate-500 dark:text-gray-400' : 'text-slate-900 dark:text-white'}`}>{email.sender}</p>
            <p className="text-sm text-slate-600 dark:text-gray-300 truncate">{email.subject}</p>
         </div>
      </div>
      <span className="text-xs text-slate-500 dark:text-gray-500 flex-shrink-0 ml-2">{email.timestamp}</span>
    </div>
  </button>
);

const EmailDetail: React.FC<{ email: Email | null; }> = ({ email }) => {
  const context = useContext(AppContext);

  if (!context) return null;

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-slate-500 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-gray-700/50">
        <p>Select an email to read</p>
      </div>
    );
  }

  const handleSummarize = () => {
    context.setActiveView(ActiveView.SUMMARY);
  };

  return (
    <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200/50 dark:border-gray-700/50">
      <div className="p-6 border-b border-slate-200/50 dark:border-gray-700/50">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{email.subject}</h2>
        <div className="flex items-center">
          <Avatar name={email.sender} className="w-10 h-10 mr-3" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{email.sender}</p>
            <p className="text-sm text-slate-600 dark:text-gray-400">to me</p>
          </div>
          <span className="text-sm text-slate-500 dark:text-gray-500 ml-auto">{email.timestamp}</span>
        </div>
      </div>
      <div className="p-6 overflow-y-auto flex-1 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }} />
      {email.attachments && email.attachments.length > 0 && (
          <div className="p-6 border-t border-slate-200/50 dark:border-gray-700/50">
              <h3 className="font-bold mb-3 text-slate-900 dark:text-white flex items-center"><PaperclipIcon className="w-5 h-5 mr-2"/> Attachments</h3>
              <div className="flex gap-4 flex-wrap">
                  {email.attachments.map(att => (
                      <div key={att.name} className="bg-slate-200/50 dark:bg-gray-700/50 p-3 rounded-lg text-sm flex items-center gap-2">
                          <span>{att.name} ({Math.round(att.size / 1024)} KB)</span>
                      </div>
                  ))}
              </div>
          </div>
      )}
      <div className="p-4 bg-slate-900/5 dark:bg-black/20 mt-auto">
          <button onClick={handleSummarize} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              <SparklesIcon className="w-5 h-5" />
              Summarize with AI
          </button>
      </div>
    </div>
  );
};

export const InboxPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { emails, selectedEmail, setSelectedEmail, isFetchingEmails } = context;

  const unreadCount = useMemo(() => emails.filter(e => !e.isRead).length, [emails]);

  return (
    <div className="flex h-full gap-6">
      <div className="w-1/3 max-w-md bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200/50 dark:border-gray-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-200/50 dark:border-gray-700/50 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inbox</h2>
            {unreadCount > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount} Unread</span>}
        </div>
        <div className="overflow-y-auto flex-1">
          {isFetchingEmails ? (
            <div className="flex items-center justify-center h-full text-slate-600 dark:text-gray-400 gap-3">
                <Spinner />
                <span>Fetching emails...</span>
            </div>
          ) : emails.length > 0 ? (
            emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={() => setSelectedEmail(email)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-gray-500 p-4 text-center">
                <p>Your inbox is empty or could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 h-full">
        <EmailDetail email={selectedEmail} />
      </div>
    </div>
  );
};