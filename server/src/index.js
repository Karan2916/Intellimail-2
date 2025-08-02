import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads

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

// --- Centralized Error Handler ---
const handleApiError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ message: message || 'An internal server error occurred' });
};

// --- API Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// --- TEMPORARY DEBUG ENDPOINT ---
app.get('/api/debug-key', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 10) {
    // Only show the first 5 and last 5 chars for security
    const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`;
    res.status(200).json({
      message: 'SUCCESS: GEMINI_API_KEY environment variable was found.',
      keyPreview: maskedKey
    });
  } else {
    res.status(404).json({
      message: 'FATAL ERROR: GEMINI_API_KEY is MISSING or invalid.'
    });
  }
});

// Generate Email Content
app.post('/api/generate', async (req, res) => {
  const { prompt, tone } = req.body;
  if (!prompt || !tone) {
    return res.status(400).json({ message: 'Prompt and tone are required.' });
  }

  try {
    const fullPrompt = `You are an expert email assistant. Write a professional email based on the user's prompt. The tone of the email should be ${tone}. Respond with only the email body content, without any greetings or sign-offs unless specified in the prompt.\n\nUser Prompt: "${prompt}"`;
    const result = await model.generateContent(fullPrompt);
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
    const result = await model.generateContent(fullPrompt);
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
    const result = await model.generateContent([textPart, imagePart]);
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
    const result = await searchModel.generateContent([systemInstruction, prompt]);
    const resultText = result.response.text().trim();
    const matchingIds = resultText ? JSON.parse(resultText) : [];
    const results = emails.filter(email => matchingIds.includes(email.id));
    res.json({ results });
  } catch (error) {
    handleApiError(res, error, 'Failed to perform AI search.');
  }
});

// Export the app for Vercel
export default app;