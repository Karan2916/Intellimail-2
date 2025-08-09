import React, { useState, useContext } from 'react';
import { AppContext } from '../state/AppContext';
import { searchEmails } from '../api/geminiService';
import { type Email, ActiveView } from '../types';
import { sanitizeHtml } from '../utils/htmlSanitizer';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Card, CardActionArea, CardContent, Container, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchResultItem: React.FC<{ email: Email; onClick: () => void }> = ({ email, onClick }) => (
    <Card variant="outlined">
        <CardActionArea onClick={onClick}>
            <CardContent>
                <Typography variant="body1" fontWeight="bold">{email.sender}</Typography>
                <Typography variant="body1" color="primary">{email.subject}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.snippet) }}></Typography>
            </CardContent>
        </CardActionArea>
    </Card>
);

export const SearchPage: React.FC = () => {
  const context = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!context) return null;
  const { emails, setActiveView, setSelectedEmail } = context;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setHasSearched(true);
    const searchResults = await searchEmails(query, emails);
    setResults(searchResults);
    setIsLoading(false);
  };

  const handleResultClick = (email: Email) => {
    setSelectedEmail(email);
    setActiveView(ActiveView.INBOX);
  }

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>Semantic Search</Typography>
        <Typography color="text.secondary">Find anything in your inbox using natural language.</Typography>
      </Box>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g., "Find emails from HR about the retreat"'
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" size="large" disabled={!query || isLoading}>
          Search
        </Button>
      </Box>

      <Paper sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h2" gutterBottom>Results</Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>Searching with AI...</Typography>
            </Box>
          ) : hasSearched ? (
            results.length > 0 ? (
              results.map(email => <SearchResultItem key={email.id} email={email} onClick={() => handleResultClick(email)} />)
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography>No results found for "{query}"</Typography>
              </Box>
            )
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <Typography color="text.secondary">Use the search bar above to find emails by topic, sender, or content.<br/>The AI will understand your intent.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};