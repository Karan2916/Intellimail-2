import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../state/AppContext';
import { summarizeText, summarizeImage } from '../api/geminiService';
import { SparklesIcon, Spinner } from '../components/common/Icons';

enum SummarySource {
  EMAIL = 'email',
  ATTACHMENT = 'attachment',
}

/**
 * A helper function to safely convert an HTML string to plain text
 * by leveraging the browser's built-in DOM parser. This is more
 * robust than using regex for stripping HTML tags.
 * @param html The HTML string.
 * @returns The plain text content.
 */
const htmlToText = (html: string): string => {
  try {
    if (typeof DOMParser === 'undefined') {
      // Fallback for non-browser environments (though this app is client-side)
      return html.replace(/<[^>]*>/g, '\n');
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  } catch (error) {
    console.error("Could not parse HTML", error);
    // Fallback to simple regex if parser fails
    return html.replace(/<[^>]*>/g, '\n');
  }
};

export const SummaryPage: React.FC = () => {
  const context = useContext(AppContext);
  const [source, setSource] = useState<SummarySource>(SummarySource.EMAIL);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const { selectedEmail } = context || {};

  const generateSummary = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      let result = '';
      if (source === SummarySource.EMAIL) {
        if (!selectedEmail) {
          setError('Please select an email from the inbox first.');
          return;
        }
        // Use the robust HTML-to-text converter
        const emailText = `${selectedEmail.subject}\n\n${htmlToText(selectedEmail.body)}`;

        // Truncate very long emails to prevent API timeouts or errors.
        const MAX_CHARS = 15000; 
        let textToSummarize = emailText;
        if (emailText.length > MAX_CHARS) {
            console.warn(`Email content is very long (${emailText.length} chars). Truncating to ${MAX_CHARS} for summarization.`);
            textToSummarize = emailText.substring(0, MAX_CHARS);
        }

        result = await summarizeText(textToSummarize);
      } else {
        if (!file) {
          setError('Please select a file to summarize.');
          return;
        }
        if (!file.type.startsWith('image/')) {
            setError('File summarization currently only supports images. PDF support coming soon!');
            return;
        }
        result = await summarizeImage(file);
      }
      setSummary(result);
    } catch (err) {
      setError('An error occurred while generating the summary. The API may be busy or the content could not be processed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [source, selectedEmail, file]);
  
  useEffect(() => {
    // Auto-summarize if an email is selected when switching to this view
    if (source === SummarySource.EMAIL && selectedEmail) {
      generateSummary();
    }
  }, [selectedEmail, source, generateSummary]);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Summary</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-2">Get key insights from long emails or attachments in seconds.</p>
      </div>

      <div className="p-6 bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4">
        <div className="flex bg-slate-200 dark:bg-gray-900/50 p-1 rounded-lg">
          <button
            onClick={() => setSource(SummarySource.EMAIL)}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${source === SummarySource.EMAIL ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-300/50 dark:hover:bg-gray-700/50'}`}
          >
            Summarize Email
          </button>
          <button
            onClick={() => setSource(SummarySource.ATTACHMENT)}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${source === SummarySource.ATTACHMENT ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-300/50 dark:hover:bg-gray-700/50'}`}
          >
            Summarize Attachment
          </button>
        </div>
        
        {source === SummarySource.EMAIL && (
          <div className="text-center text-slate-700 dark:text-gray-300 p-2 rounded-lg bg-slate-200/70 dark:bg-black/20">
            {selectedEmail ? `Selected Email: "${selectedEmail.subject}"` : 'Go to your inbox to select an email.'}
          </div>
        )}

        {source === SummarySource.ATTACHMENT && (
          <div>
            <label htmlFor="file-upload" className="w-full flex justify-center px-4 py-6 bg-slate-100/50 dark:bg-gray-900/50 border-2 border-dashed border-slate-400 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-gray-400">{file ? `Selected: ${file.name}` : 'Click to upload an image attachment'}</p>
                <p className="text-xs text-slate-600 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/*"/>
            </label>
          </div>
        )}
        <div className="flex justify-end">
            <button
                onClick={generateSummary}
                disabled={isLoading || (source === SummarySource.EMAIL && !selectedEmail) || (source === SummarySource.ATTACHMENT && !file)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
                {isLoading ? <Spinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                <span>{isLoading ? 'Summarizing...' : 'Generate Summary'}</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Summary</h2>
        <div className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none text-slate-700 dark:text-gray-300">
          {isLoading && <p>Thinking...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {summary && <div className="whitespace-pre-wrap">{summary}</div>}
          {!isLoading && !error && !summary && <p className="text-slate-500 dark:text-gray-500">Your summary will appear here.</p>}
        </div>
      </div>
    </div>
  );
};