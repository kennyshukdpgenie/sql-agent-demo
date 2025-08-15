import React from 'react';
import { Box, Modal, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { FileText } from 'lucide-react';

const PDFProgressModal = ({ open, progress, message, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="pdf-progress-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        maxWidth: 400,
        width: '100%',
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <CircularProgress size={40} sx={{ mr: 2 }} />
          <FileText size={32} color="#1976d2" />
        </Box>
        
        <Typography variant="h6" component="h2" gutterBottom>
          Generating PDF...
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message || 'Please wait while we prepare your PDF document.'}
        </Typography>
        
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#1976d2'
              }
            }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {progress}% Complete
        </Typography>
      </Box>
    </Modal>
  );
};

export default PDFProgressModal; 