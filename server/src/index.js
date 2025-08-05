import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Gemini AI Initialization ---
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});

// --- [IMPROVED] Centralized Error Handler ---
const handleApiError = (res, error, message) => {
  console.error(message, error);
  const errorMessage = error.message || 'An internal server error occurred';
  const errorStack = process.env.NODE_ENV !== 'production' ? error.stack : undefined;
  res.status(500).json({ 
    message: message || errorMessage,
    stack: errorStack
  });
};

// --- API Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// All your AI endpoints (generate, summarize, search, etc.)
// ... (Your existing app.post routes go here)

// --- [NEW] Catch-all for 404 Not Found errors ---
app.use((req, res, next) => {
  res.status(404).json({ 
    message: `Route Not Found`,
    method: req.method,
    path: req.originalUrl 
  });
});

// --- Server Startup Code for Render ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});