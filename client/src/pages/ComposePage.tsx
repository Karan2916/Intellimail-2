import React, { useState, useContext } from 'react';
import { AppContext } from '../state/AppContext';
import { Tone } from '../types';
import { generateEmailContent } from '../api/geminiService';
import { sendGmail } from '../api/googleApiService';
import { SparklesIcon, Spinner, SendIcon } from '../components/common/Icons';

export const ComposePage: React.FC = () => {
  const context = useContext(AppContext);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  
  const { accessToken, userInfo } = context || {};
  const isReady = !!accessToken && !!userInfo;

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt first.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setGeneratedEmail('');
    try {
      const result = await generateEmailContent(prompt, tone);
      setGeneratedEmail(result);
    } catch (error) {
      console.error(error);
      setError('Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSend = async () => {
      if (!recipient || !subject || !generatedEmail || !isReady) {
          setError("Please fill in all fields and ensure you're logged in.");
          return;
      }
      setIsSending(true);
      setError('');
      try {
        if (!userInfo?.email) {
          throw new Error("User email not found.");
        }
        await sendGmail(accessToken!, recipient, userInfo.email, subject, generatedEmail);
        alert(`Email sent successfully!\n\nTo: ${recipient}`);
        setRecipient('');
        setSubject('');
        setPrompt('');
        setGeneratedEmail('');
      } catch (err: any) {
        console.error("Failed to send email:", err);
        setError(`Failed to send email: ${err.message}`);
      } finally {
        setIsSending(false);
      }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Email Composer</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-2">Describe what you want to say, and let AI draft the perfect email for you.</p>
      </div>

      <fieldset disabled={!isReady} className="p-6 bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4 disabled:opacity-50">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Recipient</label>
           <input
            id="recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            placeholder="recipient@example.com"
          />
        </div>
         <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Subject</label>
           <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            placeholder="Email subject line"
          />
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Your Prompt</label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            placeholder="e.g., write an email to my team about the new project deadline being moved to next Friday"
          />
        </div>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Select Tone</label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="w-full bg-slate-100/50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            {Object.values(Tone).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
                {isGenerating ? <Spinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                <span>{isGenerating ? 'Generating...' : 'Generate Email'}</span>
            </button>
        </div>
      </fieldset>

      <div className="flex-1 flex flex-col p-6 bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Generated Draft</h2>
        {isGenerating ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="space-y-4 w-full">
                    <div className="h-4 bg-slate-200/80 dark:bg-gray-700/50 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-slate-200/80 dark:bg-gray-700/50 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-slate-200/80 dark:bg-gray-700/50 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-slate-200/80 dark:bg-gray-700/50 rounded animate-pulse w-1/2"></div>
                </div>
            </div>
        ) : (
            <textarea
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
                className="w-full flex-1 bg-transparent text-slate-700 dark:text-gray-300 focus:outline-none resize-none disabled:opacity-50"
                placeholder="AI-generated email will appear here..."
                disabled={!isReady}
            />
        )}
         <div className="mt-auto pt-4 flex justify-end">
              <button
                onClick={handleSend}
                disabled={!generatedEmail || isGenerating || !recipient || !subject || !isReady || isSending}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:bg-green-800 disabled:cursor-not-allowed"
              >
                {isSending ? <Spinner className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
                <span>{isSending ? 'Sending...' : 'Approve & Send'}</span>
            </button>
         </div>
      </div>
    </div>
  );
};