# IntelliMail - Smart Mail Agent

This repository contains the source code for IntelliMail, a smart email assistant powered by the Gemini API.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

## Local Development Setup

Follow these steps to get the application running on your local machine.

### 1. Install Dependencies

First, install the necessary dependencies for both the client and server workspaces. Run this command from the root directory:

```bash
npm install
```

### 2. Configure Environment Variables

The application requires API keys to function correctly.

#### a. Gemini API Key (Backend)

The server uses the Gemini API to power its AI features.

1.  Visit Google AI Studio to create a new API key.
2.  In the `server/` directory, create a new file named `.env`.
3.  Add your API key to the `.env` file:
    ```
    GEMINI_API_KEY='YOUR_API_KEY_HERE'
    ```

#### b. Google Client ID (Frontend)

The client application uses Google Sign-In for authentication.

1.  Go to the Google API Console.
2.  Create a new **OAuth 2.0 Client ID** for a **Web application**.
3.  Open the frontend configuration file located at `client/src/config.ts`.
4.  Paste your generated Client ID into the `GOOGLE_CLIENT_ID` variable.

### 3. Run the Application

Once the configuration is complete, you can start the development server. This command will run both the frontend and backend concurrently.

```bash
npm run dev
```

After running the command, the application should be accessible in your web browser. You may need to restart the server after adding the `.env` file for the changes to take effect.
