import React, { useState, useContext } from 'react';
import { AppContext } from '../state/AppContext';
import { Tone } from '../types';
import { generateEmailContent } from '../api/geminiService';
import { sendGmail } from '../api/googleApiService';
import { Box, Paper, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Container } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AutoAwesome as SparklesIcon, Send as SendIcon } from '@mui/icons-material';

export const ComposePage: React.FC = () => {
  const context = useContext(AppContext);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  
  const { accessToken, userInfo } = context || {};
  const isReady = !!accessToken && !!userInfo;

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt first.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setGeneratedEmail('');
    try {
      const result = await generateEmailContent(prompt, tone);
      setGeneratedEmail(result);
    } catch (error) {
      console.error(error);
      setError('Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSend = async () => {
      if (!recipient || !subject || !generatedEmail || !isReady) {
          setError("Please fill in all fields and ensure you're logged in.");
          return;
      }
      setIsSending(true);
      setError('');
      try {
        if (!userInfo?.email) {
          throw new Error("User email not found.");
        }
        await sendGmail(accessToken!, recipient, userInfo.email, subject, generatedEmail);
        alert(`Email sent successfully!\n\nTo: ${recipient}`);
        setRecipient('');
        setSubject('');
        setPrompt('');
        setGeneratedEmail('');
      } catch (err: any) {
        console.error("Failed to send email:", err);
        setError(`Failed to send email: ${err.message}`);
      } finally {
        setIsSending(false);
      }
  }

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>AI Email Composer</Typography>
        <Typography color="text.secondary">Describe what you want to say, and let AI draft the perfect email for you.</Typography>
      </Box>

      <Paper component="fieldset" disabled={!isReady} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Recipient"
          type="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="recipient@example.com"
          fullWidth
        />
        <TextField
          label="Subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject line"
          fullWidth
        />
        <TextField
          label="Your Prompt"
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., write an email to my team about the new project deadline being moved to next Friday"
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="tone-select-label">Tone</InputLabel>
          <Select
            labelId="tone-select-label"
            id="tone-select"
            value={tone}
            label="Tone"
            onChange={(e) => setTone(e.target.value as Tone)}
          >
            {Object.values(Tone).map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            onClick={handleGenerate}
            loading={isGenerating}
            loadingPosition="start"
            startIcon={<SparklesIcon />}
            variant="contained"
          >
            {isGenerating ? 'Generating...' : 'Generate Email'}
          </LoadingButton>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h2" gutterBottom>Generated Draft</Typography>
        <Box sx={{ flex: 1, position: 'relative' }}>
          {isGenerating ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">Generating draft...</Typography>
            </Box>
          ) : (
            <TextField
              multiline
              fullWidth
              value={generatedEmail}
              onChange={(e) => setGeneratedEmail(e.target.value)}
              placeholder="AI-generated email will appear here..."
              disabled={!isReady}
              sx={{ height: '100%', '& .MuiOutlinedInput-root': { height: '100%' }, '& .MuiOutlinedInput-input': { height: '100% !important', resize: 'none' } }}
            />
          )}
        </Box>
        <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            onClick={handleSend}
            loading={isSending}
            loadingPosition="start"
            startIcon={<SendIcon />}
            variant="contained"
            color="success"
            disabled={!generatedEmail || isGenerating || !recipient || !subject || !isReady}
          >
            {isSending ? 'Sending...' : 'Approve & Send'}
          </LoadingButton>
        </Box>
      </Paper>
    </Container>
  );
};