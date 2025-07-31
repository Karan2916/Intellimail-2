import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // In production, configure this for your frontend's domain
// Increase payload size limit for base64 images
app.use(express.json({ limit: '10mb' }));

// Securely initialize Gemini AI
// The API key MUST be set as an environment variable in your hosting provider.
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set.");
    process.exit(1); // Exit if the key is not configured
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// Centralized error handler
const handleApiError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ message: message || 'An internal server error occurred' });
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
    const systemInstruction = `You are an expert email assistant. Write a professional email based on the user's prompt. The tone of the email should be ${tone}. Respond with only the email body content, without any greetings or sign-offs unless specified in the prompt.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: { systemInstruction, temperature: 0.7 }
    });
    
    res.json({ content: response.text() });
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
    const prompt = `Please summarize the following email thread into a few key bullet points. Focus on action items, decisions, and important questions. Here is the text:\n\n---\n\n${text}`;
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
    });
    res.json({ summary: response.text() });
  } catch (error) {
    handleApiError(res, error, 'Failed to summarize text.');
  }
});

// Summarize Image
app.post('/api/summarize-image', async (req, res) => {
    const { image, mimeType } = req.body; // image is a base64 encoded string
    if (!image || !mimeType) {
        return res.status(400).json({ message: 'A base64-encoded image and its mimeType are required.' });
    }

    try {
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: "Analyze this image. If it's a document or chart, summarize its key information. If it's a picture, describe what is happening in detail.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        res.json({ summary: response.text() });
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
        const systemInstruction = `You are a powerful semantic search agent for an email client. Your task is to analyze a user's natural language query and find matching emails from a provided JSON list.
Respond ONLY with a JSON array of the IDs of the emails that match the query. Do not add any other text, explanation, or markdown formatting.
For example, if the emails with IDs "3" and "5" match, your response should be:
["3", "5"]`;
        
        const simplifiedEmails = emails.map(e => ({ id: e.id, from: e.sender, subject: e.subject, snippet: e.snippet }));
        const prompt = `User Query: "${query}"\n\nEmail List (JSON):\n${JSON.stringify(simplifiedEmails, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const resultText = response.text().trim();
        const matchingIds = resultText ? JSON.parse(resultText) : [];
        const results = emails.filter(email => matchingIds.includes(email.id));
        
        res.json({ results });
        
    } catch (error) {
        handleApiError(res, error, 'Failed to perform AI search.');
    }
});


// Start server
app.listen(port, () => {
  console.log(`IntelliMail server listening at http://localhost:${port}`);
});

// Export the app for Vercel's serverless environment
export default app;
