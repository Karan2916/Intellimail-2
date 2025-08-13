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
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// --- [NEW] Retry Logic with Exponential Backoff ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, maxRetries = 3) {
  let attempts = 0;
  let waitTime = 1000; // Start with a 1-second wait

  while (attempts < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result; // If successful, return the result immediately
    } catch (error) {
      attempts++;
      // Check if it's a 503 error (or other retryable server errors)
      if (error.status === 503 && attempts < maxRetries) {
        console.log(`Model overloaded. Retrying in ${waitTime / 1000}s... (Attempt ${attempts}/${maxRetries})`);
        await delay(waitTime);
        waitTime *= 2; // Double the wait time for the next attempt
      } else {
        // For other errors, or if max retries are reached, throw the error
        throw error;
      }
    }
  }
}

// --- Centralized Error Handler ---
const handleApiError = (res, error, message) => {
  console.error(message, error);
  const errorMessage = error.message || 'An internal server error occurred';
  const errorStack = process.env.NODE_ENV !== 'production' ? error.stack : undefined;
  // Use the error's status code if it exists, otherwise default to 500
  const status = error.status || 500;
  
  res.status(status).json({
    message: message || errorMessage,
    stack: errorStack
  });
};

// --- API Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Generate Email Content
app.post('/api/generate', async (req, res) => {
  const { prompt, tone } = req.body;
  if (!prompt || !tone) {
    return res.status(400).json({ message: 'Prompt and tone are required.' });
  }

  try {
    const fullPrompt = `You are an expert email assistant. Write a professional email based on the user's prompt. The tone of the email should be ${tone}. Respond with only the email body content, without any greetings or sign-offs unless specified in the prompt.\n\nUser Prompt: "${prompt}"`;
    // Use the retry logic
    const result = await generateWithRetry(model, fullPrompt);
    res.json({ content: result.response.text() });
  } catch (error) {
    handleApiError(res, error, 'Failed to generate email content.');
  }
});

// Summarize Text
app.post('/api/summarize-text', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Text to summarize is required.' });
  }

  try {
    const fullPrompt = `Please summarize the following email thread into a few key bullet points. Focus on action items, decisions, and important questions. Here is the text:\n\n---\n\n${text}`;
    // Use the retry logic
    const result = await generateWithRetry(model, fullPrompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    handleApiError(res, error, 'Failed to summarize text.');
  }
});

// Summarize Image
app.post('/api/summarize-image', async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image || !mimeType) {
    return res.status(400).json({ message: 'A base64-encoded image and its mimeType are required.' });
  }

  try {
    const imagePart = { inlineData: { data: image, mimeType: mimeType } };
    const textPart = "Analyze this image. If it's a document or chart, summarize its key information. If it's a picture, describe what is happening in detail.";
    const prompt = [textPart, imagePart];
    // Use the retry logic
    const result = await generateWithRetry(model, prompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    handleApiError(res, error, 'Failed to summarize the image.');
  }
});

// Search Emails
app.post('/api/search', async (req, res) => {
  const { query, emails } = req.body;
  if (!query || !Array.isArray(emails)) {
    return res.status(400).json({ message: 'Query and emails array are required.' });
  }

  try {
    const generationConfig = { responseMimeType: "application/json" };
    const searchModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });
    const systemInstruction = `You are a powerful semantic search agent for an email client. Your task is to analyze a user's natural language query and find matching emails from a provided JSON list. Respond ONLY with a JSON array of the IDs of the emails that match the query. For example, if the emails with IDs "3" and "5" match, your response should be:\n["3", "5"]`;
    const simplifiedEmails = emails.map(e => ({ id: e.id, from: e.sender, subject: e.subject, snippet: e.snippet }));
    const prompt = `User Query: "${query}"\n\nEmail List (JSON):\n${JSON.stringify(simplifiedEmails, null, 2)}`;
    // Use the retry logic
    const result = await generateWithRetry(searchModel, [systemInstruction, prompt]);
    const resultText = result.response.text().trim();
    const matchingIds = resultText ? JSON.parse(resultText) : [];
    const results = emails.filter(email => matchingIds.includes(email.id));
    res.json({ results });
  } catch (error) {
    handleApiError(res, error, 'Failed to perform AI search.');
  }
});

// Catch-all for 404 Not Found errors
app.use((req, res, next) => {
  res.status(404).json({
    message: `Route Not Found`,
    method: req.method,
    path: req.originalUrl
  });
});

// Export the app
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});