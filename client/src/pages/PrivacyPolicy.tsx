// client/src/pages/PrivacyPolicy.tsx

import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none text-gray-300">
      <h1>Privacy Policy for IntelliMail</h1>
      <p><strong>Last Updated:</strong> August 13, 2025</p>
      <p>Welcome to IntelliMail ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our web application.</p>
      <p>By using IntelliMail, you agree to the collection and use of information in accordance with this policy.</p>
      
      <h3>1. Information We Collect</h3>
      <p>To provide our service, we collect the following information through the Google OAuth 2.0 process:</p>
      <ul>
        <li><strong>Basic Profile Information:</strong> Your name, email address, and profile picture as provided by your Google account.</li>
        <li><strong>Email Content:</strong> We access the content of the specific emails you choose to summarize.</li>
      </ul>

      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li><strong>To Authenticate You:</strong> To securely log you into the application using your Google account.</li>
        <li><strong>To Provide the Core Service:</strong> To access the email you select and send its content to the Google Gemini API for summarization.</li>
        <li><strong>To Display Information:</strong> To display your basic profile information within the app and to show you the generated summary.</li>
      </ul>

      <h3>3. Data Storage and Retention</h3>
      <p><strong>We do not store your data.</strong> Your email content and the generated summaries are not saved on our servers. Information is processed in real-time and held only temporarily in the application's memory during the summarization process.</p>

      <h3>4. Data Sharing and Third Parties</h3>
      <p>We only share data with the following third-party service to provide our application's functionality: <strong>Google (for Gemini API)</strong>. The text content of the email you select is sent to the Google Gemini API to generate a summary. We recommend you review Google's Privacy Policy.</p>

      <h3>5. Your Rights and Choices</h3>
      <p>You can revoke IntelliMail's access to your Google Account at any time by visiting the <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Account security settings page</a>.</p>
      
      <h3>6. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at: kadyakaranbalaji@gmail.com</p>
    </div>
  );
};
