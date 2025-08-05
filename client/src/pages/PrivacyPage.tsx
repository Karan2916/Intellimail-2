import React from "react";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-gray-300 font-sans p-4 sm:p-6 md:p-8">
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg max-w-4xl w-full mx-auto p-6 sm:p-8 md:p-10 prose prose-slate dark:prose-invert prose-sm sm:prose-base">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy for IntelliMail</h1>
        <p className="text-sm text-slate-500 dark:text-gray-400"><strong>Effective Date:</strong> August 5, 2025</p>

        <p className="mt-6">This Privacy Policy describes how IntelliMail handles your information when you use our application.</p>

        <h2 className="text-xl font-bold mt-8 mb-4">Information We Access</h2>
        <p>With your explicit permission through the Google login process, our application accesses the following information from your Google Account:</p>
        <ul className="list-disc list-outside space-y-2 pl-5">
          <li>
            <strong>Basic Profile Information:</strong> Your name and email address, used to display your identity within the application.
          </li>
          <li>
            <strong>Gmail Data:</strong> We access the content of your emails (including subject, sender, and body) to provide the core functionalities of the app, such as displaying your inbox, summarizing email content, and generating draft replies.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">How We Use and Share Information</h2>
        <p>Your data is used solely to provide and improve the features of IntelliMail.</p>
        <ul className="list-disc list-outside space-y-2 pl-5">
            <li>The content of your emails is passed to the <strong>Google Gemini API</strong> for processing <strong>only</strong> when you explicitly request an AI feature (e.g., "Summarize Text" or "Generate Email").</li>
            <li>Your personal information is <strong>not stored</strong> on our servers. All data is processed in real-time.</li>
            <li>We do not sell or share your personal data with any other third parties.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">Data Security</h2>
        <p>We implement reasonable security measures to protect your information from unauthorized access or disclosure. All communication with Google's APIs is done over a secure (HTTPS) connection.</p>

        <h2 className="text-xl font-bold mt-8 mb-4">User Rights</h2>
        <p>You may request to access, update, or delete your personal information at any time by contacting us. You can revoke the application's access to your Google Account at any time through your Google Account security settings.</p>

        <h2 className="text-xl font-bold mt-8 mb-4">Changes to Privacy Policy</h2>
        <p>This policy may be updated periodically. Significant changes will be communicated to users through the application or official channels.</p>

        <h2 className="text-xl font-bold mt-8 mb-4">Contact Us</h2>
        <p>For any questions or concerns regarding this privacy policy, please contact us at [Your Name or Email Address].</p>
      </div>
    </div>
  );
};

