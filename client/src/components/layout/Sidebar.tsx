
import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { ActiveView } from '../../types';
import { Inbox as InboxIcon, Star as SparklesIcon, Edit as EditIcon, Search as SearchIcon, Logout as LogOutIcon, Mail } from '@mui/icons-material';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, IconButton, Divider } from '@mui/material';

export const Sidebar: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) return null;
  const { activeView, setActiveView, userInfo, logout, selectedEmail } = context;

  const navItems = [
    { icon: <InboxIcon />, label: 'Inbox', view: ActiveView.INBOX, disabled: false },
    { icon: <SparklesIcon />, label: 'AI Summary', view: ActiveView.SUMMARY, disabled: !selectedEmail },
    { icon: <EditIcon />, label: 'Compose AI', view: ActiveView.COMPOSE, disabled: false },
    { icon: <SearchIcon />, label: 'Search', view: ActiveView.SEARCH, disabled: false },
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: 256,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        zIndex: 10,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Mail sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" component="h1" sx={{ ml: 1.5, fontWeight: 'bold' }}>
          IntelliMail
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.view} disablePadding>
            <ListItemButton
              selected={activeView === item.view}
              onClick={() => setActiveView(item.view)}
              disabled={item.disabled}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', spaceY: 2 }}>
        <ThemeSwitcher />
        <Divider sx={{ my: 2 }} />
        {userInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={userInfo.picture} alt="avatar" sx={{ width: 32, height: 32 }} />
            <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight="medium" noWrap title={userInfo.name}>
                {userInfo.name}
              </Typography>
            </Box>
            <IconButton onClick={logout} size="small" sx={{ ml: 'auto' }} aria-label="Sign Out" title="Sign Out">
              <LogOutIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};