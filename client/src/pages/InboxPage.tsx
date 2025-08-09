
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../state/AppContext';
import { type Email, ActiveView } from '../types';
import { sanitizeHtml } from '../utils/htmlSanitizer';
import { Box, Paper, List, ListItem, ListItemButton, ListItemText, Avatar, Typography, Chip, Button, CircularProgress, Divider, Grid } from '@mui/material';
import { Attachment as PaperclipIcon, AutoAwesome as SparklesIcon } from '@mui/icons-material';

const EmailListItem: React.FC<{ email: Email; isSelected: boolean; onClick: () => void; }> = ({ email, isSelected, onClick }) => (
    <ListItem disablePadding>
        <ListItemButton selected={isSelected} onClick={onClick}>
            <Avatar sx={{ mr: 2 }}>{email.sender.charAt(0)}</Avatar>
            <ListItemText
                primary={
                    <Typography variant="body1" component="div" noWrap sx={{ fontWeight: email.isRead ? 'normal' : 'bold' }}>
                        {email.sender}
                    </Typography>
                }
                secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {email.subject}
                    </Typography>
                }
            />
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                {email.timestamp}
            </Typography>
        </ListItemButton>
    </ListItem>
);

const EmailDetail: React.FC<{ email: Email | null; }> = ({ email }) => {
  const context = useContext(AppContext);

  if (!context) return null;

  if (!email) {
    return (
      <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.default' }}>
        <Typography>Select an email to read</Typography>
      </Paper>
    );
  }

  const handleSummarize = () => {
    context.setActiveView(ActiveView.SUMMARY);
  };

  return (
    <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {email.subject}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2 }}>{email.sender.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body1" fontWeight="medium">{email.sender}</Typography>
            <Typography variant="body2" color="text.secondary">to me</Typography>
          </Box>
          <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
            {email.timestamp}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1, '& a': { color: 'primary.main' } }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }} />
      {email.attachments && email.attachments.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PaperclipIcon sx={{ mr: 1 }} />
            Attachments
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {email.attachments.map(att => (
              <Chip key={att.name} label={`${att.name} (${Math.round(att.size / 1024)} KB)`} />
            ))}
          </Box>
        </Box>
      )}
      <Box sx={{ p: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<SparklesIcon />}
          onClick={handleSummarize}
        >
          Summarize with AI
        </Button>
      </Box>
    </Paper>
  );
};

export const InboxPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { emails, selectedEmail, setSelectedEmail, isFetchingEmails } = context;

  const unreadCount = useMemo(() => emails.filter(e => !e.isRead).length, [emails]);

  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">Inbox</Typography>
              {unreadCount > 0 && <Chip label={`${unreadCount} Unread`} color="primary" size="small" />}
            </Box>
          </Box>
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {isFetchingEmails ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography>Fetching emails...</Typography>
              </Box>
            ) : emails.length > 0 ? (
              <List disablePadding>
                {emails.map((email) => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isSelected={selectedEmail?.id === email.id}
                    onClick={() => setSelectedEmail(email)}
                  />
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 2 }}>
                <Typography>Your inbox is empty or could not be loaded.</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8} sx={{ height: '100%' }}>
        <EmailDetail email={selectedEmail} />
      </Grid>
    </Grid>
  );
};