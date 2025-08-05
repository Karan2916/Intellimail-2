import React from "react";

const PrivacyPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-8">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600">This is the privacy policy for our application. Information about data collection, usage, and user rights will be detailed here.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;