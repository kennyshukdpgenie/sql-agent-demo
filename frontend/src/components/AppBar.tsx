import React from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const AppBar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            {t('header.appTitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            {t('header.newOrder')}
          </Button>
          <Button color="inherit" onClick={() => navigate('/orders')}>
            {t('header.orders')}
          </Button>
          <Button color="inherit" onClick={() => navigate('/analytics')}>
            {t('header.analytics')}
          </Button>
          <Button color="inherit" onClick={() => navigate('/suit-visualizer')}>
            Suit Visualizer
          </Button>
          <LanguageSelector />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar; 