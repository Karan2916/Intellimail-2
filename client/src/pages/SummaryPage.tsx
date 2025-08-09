import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../state/AppContext';
import { summarizeText, summarizeImage } from '../api/geminiService';
import { Box, Paper, Typography, Button, ToggleButtonGroup, ToggleButton, CircularProgress, Alert, Container } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AutoAwesome as SparklesIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';

enum SummarySource {
  EMAIL = 'email',
  ATTACHMENT = 'attachment',
}

/**
 * A helper function to safely convert an HTML string to plain text
 * by leveraging the browser's built-in DOM parser. This is more
 * robust than using regex for stripping HTML tags.
 * @param html The HTML string.
 * @returns The plain text content.
 */
const htmlToText = (html: string): string => {
  try {
    if (typeof DOMParser === 'undefined') {
      // Fallback for non-browser environments (though this app is client-side)
      return html.replace(/<[^>]*>/g, '\n');
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  } catch (error) {
    console.error("Could not parse HTML", error);
    // Fallback to simple regex if parser fails
    return html.replace(/<[^>]*>/g, '\n');
  }
};

export const SummaryPage: React.FC = () => {
  const context = useContext(AppContext);
  const [source, setSource] = useState<SummarySource>(SummarySource.EMAIL);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const { selectedEmail } = context || {};

  const generateSummary = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      let result = '';
      if (source === SummarySource.EMAIL) {
        if (!selectedEmail) {
          setError('Please select an email from the inbox first.');
          return;
        }
        // Use the robust HTML-to-text converter
        const emailText = `${selectedEmail.subject}\n\n${htmlToText(selectedEmail.body)}`;

        // Truncate very long emails to prevent API timeouts or errors.
        const MAX_CHARS = 15000; 
        let textToSummarize = emailText;
        if (emailText.length > MAX_CHARS) {
            console.warn(`Email content is very long (${emailText.length} chars). Truncating to ${MAX_CHARS} for summarization.`);
            textToSummarize = emailText.substring(0, MAX_CHARS);
        }

        result = await summarizeText(textToSummarize);
      } else {
        if (!file) {
          setError('Please select a file to summarize.');
          return;
        }
        if (!file.type.startsWith('image/')) {
            setError('File summarization currently only supports images. PDF support coming soon!');
            return;
        }
        result = await summarizeImage(file);
      }
      setSummary(result);
    } catch (err) {
      setError('An error occurred while generating the summary. The API may be busy or the content could not be processed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [source, selectedEmail, file]);
  
  useEffect(() => {
    // Auto-summarize if an email is selected when switching to this view
    if (source === SummarySource.EMAIL && selectedEmail) {
      generateSummary();
    }
  }, [selectedEmail, source, generateSummary]);

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>AI Summary</Typography>
        <Typography color="text.secondary">Get key insights from long emails or attachments in seconds.</Typography>
      </Box>

      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ToggleButtonGroup
          value={source}
          exclusive
          onChange={(e, newSource) => newSource && setSource(newSource)}
          aria-label="summary source"
          fullWidth
        >
          <ToggleButton value={SummarySource.EMAIL}>Summarize Email</ToggleButton>
          <ToggleButton value={SummarySource.ATTACHMENT}>Summarize Attachment</ToggleButton>
        </ToggleButtonGroup>
        
        {source === SummarySource.EMAIL && (
          <Alert severity="info" variant="outlined">
            {selectedEmail ? `Selected Email: "${selectedEmail.subject}"` : 'Go to your inbox to select an email.'}
          </Alert>
        )}

        {source === SummarySource.ATTACHMENT && (
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{
              borderStyle: 'dashed',
              py: 2,
              '&:hover': {
                borderStyle: 'dashed',
              }
            }}
          >
            {file ? `Selected: ${file.name}` : 'Upload an image attachment'}
            <input type="file" hidden onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/*" />
          </Button>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
                onClick={generateSummary}
                loading={isLoading}
                loadingPosition="start"
                startIcon={<SparklesIcon />}
                variant="contained"
                disabled={(source === SummarySource.EMAIL && !selectedEmail) || (source === SummarySource.ATTACHMENT && !file)}
            >
                {isLoading ? 'Summarizing...' : 'Generate Summary'}
            </LoadingButton>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h2" gutterBottom>Summary</Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          {isLoading && <Typography>Thinking...</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
          {summary && <Typography>{summary}</Typography>}
          {!isLoading && !error && !summary && <Typography color="text.secondary">Your summary will appear here.</Typography>}
        </Box>
      </Paper>
    </Container>
  );
};