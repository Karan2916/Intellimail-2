import React, { useState, useContext } from 'react';
import { AppContext } from '../state/AppContext';
import { searchEmails } from '../api/geminiService';
import { type Email, ActiveView } from '../types';
import { SearchIcon, Spinner } from '../components/common/Icons';
import { sanitizeHtml } from '../utils/htmlSanitizer';

const SearchResultItem: React.FC<{ email: Email; onClick: () => void }> = ({ email, onClick }) => (
    <div onClick={onClick} className="p-4 bg-white/40 hover:bg-slate-200/50 dark:bg-gray-800/40 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border border-slate-200/50 dark:border-gray-700/50 rounded-lg">
        <p className="font-bold text-slate-900 dark:text-white">{email.sender}</p>
        <p className="text-blue-500 dark:text-blue-400 font-semibold">{email.subject}</p>
        <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.snippet) }}></p>
    </div>
);

export const SearchPage: React.FC = () => {
  const context = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!context) return null;
  const { emails, setActiveView, setSelectedEmail } = context;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setHasSearched(true);
    const searchResults = await searchEmails(query, emails);
    setResults(searchResults);
    setIsLoading(false);
  };

  const handleResultClick = (email: Email) => {
    setSelectedEmail(email);
    setActiveView(ActiveView.INBOX);
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Semantic Search</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-2">Find anything in your inbox using natural language.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g., "Find emails from HR about the retreat"'
          className="w-full bg-white/50 dark:bg-gray-800/50 border border-slate-300 dark:border-gray-700 rounded-lg p-4 pl-12 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all backdrop-blur-md"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors">
          Search
        </button>
      </form>

      <div className="flex-1 flex flex-col p-6 bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-gray-700/50 overflow-hidden">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Results</h2>
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-600 dark:text-gray-400 gap-3">
              <Spinner />
              <p>Searching with AI...</p>
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              results.map(email => <SearchResultItem key={email.id} email={email} onClick={() => handleResultClick(email)} />)
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-gray-500">
                <p>No results found for "{query}"</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-gray-500 text-center">
                <p>Use the search bar above to find emails by topic, sender, or content.<br/>The AI will understand your intent.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};