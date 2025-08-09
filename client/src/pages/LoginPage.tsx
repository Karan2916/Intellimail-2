import React, { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AppContext } from '../state/AppContext';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Mail } from '@mui/icons-material';

const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const LoginPage: React.FC = () => {
  const context = useContext(AppContext);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      context?.login(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
    scope: GMAIL_SCOPES,
    flow: 'implicit',
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={12}
        sx={{
          padding: 4,
          borderRadius: 4,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              mx: 'auto',
              p: 1.5,
              bgcolor: 'primary.main',
              width: 'fit-content',
              borderRadius: '50%',
              color: 'primary.contrastText',
              mb: 2,
            }}
          >
            <Mail sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to IntelliMail
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in with your Google account to continue.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleGoogleLogin()}
          startIcon={
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          }
          sx={{ width: '100%', py: 1.5 }}
        >
          Sign in with Google
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          By signing in, you grant IntelliMail permission to read and send emails on your behalf.
        </Typography>
      </Paper>
    </Container>
  );
};
