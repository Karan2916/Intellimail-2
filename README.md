# IntelliMail - Smart Mail Agent

A smart email assistant powered by the Gemini API that can summarize your emails, letting you catch up with your inbox in minutes.

**[Live Demo](https://intellimail-0bpw.onrender.com)**

![IntelliMail Screenshot](https://github.com/user-attachments/assets/6bc16ec8-8a46-4cf8-9e16-32fafccdf64b)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

## Local Development Setup

Follow these steps to get the application running on your local machine.

### 1. Install Dependencies

First, install the necessary dependencies for both the client and server workspaces. Run this command from the root directory:

```bash
npm install

2. Configure Environment Variables
The application requires API keys to function correctly.

a. Gemini API Key (Backend)
The server uses the Gemini API to power its AI features.

Visit Google AI Studio to create a new API key.

In the server/ directory, create a new file named .env.

Add your API key to the .env file:

GEMINI_API_KEY='YOUR_API_KEY_HERE'
b. Google Client ID (Frontend)
The client application uses Google Sign-In for authentication.

Go to the Google API Console.

Create a new OAuth 2.0 Client ID for a Web application.

In the client/ directory, create a new file named .env.local.

Add your Client ID to the .env.local file. The VITE_ prefix is required by Vite.

VITE_GOOGLE_CLIENT_ID='YOUR_GOOGLE_CLIENT_ID_HERE'
3. Run the Application
Once the configuration is complete, you can start the development server. This command will run both the frontend and backend concurrently.

Bash

npm run dev
After running the command, the application should be accessible in your web browser. You may need to restart the server after adding the .env file for the changes to take effect.


After you paste this corrected version, the fonts and formatting will look consistent and professional on your
