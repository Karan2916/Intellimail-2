
import { type Email } from '../types';

const API_BASE_URL = 'https://intellimail-server.onrender.com/api'; // Using a relative path for proxying

// Helper to handle API responses and errors
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
};


export const generateEmailContent = async (prompt: string, tone: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, tone }),
    });
    const data = await handleApiResponse(response);
    return data.content;
  } catch (error) {
    console.error("Error generating email content:", error);
    throw error;
  }
};


export const summarizeText = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/summarize-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await handleApiResponse(response);
      return data.summary;
    } catch (error) {
        console.error("Error summarizing text:", error);
        throw error;
    }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:image/png;base64,iVBORw0KGgo..."
            // we only want the "iVBORw0KGgo..." part
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const summarizeImage = async (file: File): Promise<string> => {
    try {
        const base64Image = await fileToBase64(file);
        
        const response = await fetch(`${API_BASE_URL}/summarize-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, mimeType: file.type }),
        });
        const data = await handleApiResponse(response);
        return data.summary;
    } catch (error) {
        console.error("Error summarizing image:", error);
        throw error;
    }
};


export const searchEmails = async (query: string, emails: Email[]): Promise<Email[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, emails }),
        });
        const data = await handleApiResponse(response);
        return data.results;
    } catch (error) {
        console.error("Error searching emails with AI, falling back to basic search:", error);
        // Fallback to simple text search if AI fails
        const lowerCaseQuery = query.toLowerCase();
        return emails.filter(email => 
            email.subject.toLowerCase().includes(lowerCaseQuery) || 
            (email.snippet && email.snippet.toLowerCase().includes(lowerCaseQuery)) ||
            email.sender.toLowerCase().includes(lowerCaseQuery)
        );
    }
};
