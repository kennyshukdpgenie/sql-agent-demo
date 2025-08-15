import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import SuitModel from './SuitModel';
import CustomizationPanel from './CustomizationPanel';

const VisualizerContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1400px',
  margin: '0 auto',
  width: '100%',
}));

const ModelSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '600px',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
}));

const PriceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const OrderButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1.5),
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    transform: 'translateY(-2px)',
  },
}));

interface SuitConfig {
  color: string;
  buttonStyle: string;
  sleeveLength: string;
  lapelStyle: string;
  fabric: string;
}

function SuitVisualizer() {
  const [suitConfig, setSuitConfig] = useState<SuitConfig>({
    color: 'navy',
    buttonStyle: 'single',
    sleeveLength: 'full',
    lapelStyle: 'notched',
    fabric: 'wool'
  });

  const basePrice = 1200;
  const priceModifiers = {
    color: { navy: 0, charcoal: 0, black: 0, brown: 50 },
    buttonStyle: { single: 0, double: 100, three: 50 },
    sleeveLength: { full: 0, threequarter: -50, short: -100 },
    lapelStyle: { notched: 0, peaked: 75, shawl: 100 },
    fabric: { wool: 0, cotton: -200, silk: 300, linen: -100 }
  };

  const calculatePrice = () => {
    let totalPrice = basePrice;
    Object.keys(suitConfig).forEach(key => {
      const configKey = key as keyof SuitConfig;
      const modifierKey = key as keyof typeof priceModifiers;
      if (priceModifiers[modifierKey] && priceModifiers[modifierKey][suitConfig[configKey] as keyof typeof priceModifiers[typeof modifierKey]]) {
        totalPrice += priceModifiers[modifierKey][suitConfig[configKey] as keyof typeof priceModifiers[typeof modifierKey]];
      }
    });
    return totalPrice;
  };

  const updateSuitConfig = (key: keyof SuitConfig, value: string) => {
    setSuitConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOrderNow = () => {
    // In a real application, this could integrate with the existing order system
    // For now, we'll just show an alert
    alert(`Order placed for custom suit!\nTotal: $${calculatePrice()}\nConfiguration: ${JSON.stringify(suitConfig, null, 2)}`);
  };

  return (
    <VisualizerContainer>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Suit Visualizer
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ModelSection>
            <Typography variant="h5" component="h2" gutterBottom>
              My Suit Design
            </Typography>
            <SuitModel config={suitConfig} />
          </ModelSection>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CustomizationPanel 
              config={suitConfig} 
              onUpdate={updateSuitConfig}
            />
            
            <PriceCard>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Price
              </Typography>
              <Typography variant="h4" component="div" color="primary" gutterBottom>
                ${calculatePrice()}
              </Typography>
              <OrderButton
                variant="contained"
                fullWidth
                onClick={handleOrderNow}
              >
                Order Now
              </OrderButton>
            </PriceCard>
          </Box>
        </Grid>
      </Grid>
    </VisualizerContainer>
  );
}

export default SuitVisualizer; 