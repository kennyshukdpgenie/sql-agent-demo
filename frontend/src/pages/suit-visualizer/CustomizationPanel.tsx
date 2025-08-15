import React from 'react';
import { Box, Typography, ButtonBase, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const PanelContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  maxHeight: '600px',
  overflowY: 'auto',
}));

const OptionSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const OptionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const OptionIcon = styled('span')({
  fontSize: '1.2rem',
});

const OptionButton = styled(ButtonBase)<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(1),
  border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  background: active ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  fontSize: '0.85rem',
  fontWeight: 500,
  textAlign: 'center',
  minHeight: '60px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const ColorButton = styled(OptionButton)<{ color: string }>(({ theme, active, color }) => ({
  background: active ? `linear-gradient(135deg, ${color}, ${color}dd)` : color,
  color: (color === '#f5f5dc' || color === '#ddd') ? theme.palette.text.primary : theme.palette.common.white,
  borderColor: active ? theme.palette.common.black : theme.palette.divider,
  '&:hover': {
    borderColor: theme.palette.common.black,
    transform: 'translateY(-2px)',
  },
}));

const OptionEmoji = styled('span')({
  fontSize: '1.5rem',
});

const OptionLabel = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 500,
});

interface SuitConfig {
  color: string;
  buttonStyle: string;
  sleeveLength: string;
  lapelStyle: string;
  fabric: string;
}

interface CustomizationPanelProps {
  config: SuitConfig;
  onUpdate: (key: keyof SuitConfig, value: string) => void;
}

function CustomizationPanel({ config, onUpdate }: CustomizationPanelProps) {
  const colorOptions = [
    { name: 'navy', label: 'Navy', color: '#1a1a2e', emoji: '🟦' },
    { name: 'charcoal', label: 'Charcoal', color: '#36454f', emoji: '⬛' },
    { name: 'black', label: 'Black', color: '#0f0f0f', emoji: '⚫' },
    { name: 'brown', label: 'Brown', color: '#8b4513', emoji: '🟤' }
  ];

  const buttonStyleOptions = [
    { name: 'single', label: 'Single', emoji: '①' },
    { name: 'double', label: 'Double', emoji: '②' },
    { name: 'three', label: 'Three', emoji: '③' }
  ];

  const sleeveLengthOptions = [
    { name: 'full', label: 'Full', emoji: '👔' },
    { name: 'threequarter', label: '3/4', emoji: '🤵' },
    { name: 'short', label: 'Short', emoji: '👕' }
  ];

  const lapelStyleOptions = [
    { name: 'notched', label: 'Notched', emoji: '📐' },
    { name: 'peaked', label: 'Peaked', emoji: '⛰️' },
    { name: 'shawl', label: 'Shawl', emoji: '🧣' }
  ];

  const fabricOptions = [
    { name: 'wool', label: 'Wool', emoji: '🐑' },
    { name: 'cotton', label: 'Cotton', emoji: '🌿' },
    { name: 'silk', label: 'Silk', emoji: '✨' },
    { name: 'linen', label: 'Linen', emoji: '🌾' }
  ];

  return (
    <PanelContainer>
      <Typography variant="h6" gutterBottom align="center">
        Suit Details
      </Typography>

      <OptionSection>
        <OptionTitle>
          <OptionIcon>🎨</OptionIcon>
          Color
        </OptionTitle>
        <Grid container spacing={1}>
          {colorOptions.map(option => (
            <Grid size={6} key={option.name}>
              <ColorButton
                active={config.color === option.name}
                color={option.color}
                onClick={() => onUpdate('color', option.name)}
              >
                <OptionEmoji>{option.emoji}</OptionEmoji>
                <OptionLabel>{option.label}</OptionLabel>
              </ColorButton>
            </Grid>
          ))}
        </Grid>
      </OptionSection>

      <OptionSection>
        <OptionTitle>
          <OptionIcon>🔘</OptionIcon>
          Button Style
        </OptionTitle>
        <Grid container spacing={1}>
          {buttonStyleOptions.map(option => (
            <Grid size={4} key={option.name}>
              <OptionButton
                active={config.buttonStyle === option.name}
                onClick={() => onUpdate('buttonStyle', option.name)}
              >
                <OptionEmoji>{option.emoji}</OptionEmoji>
                <OptionLabel>{option.label}</OptionLabel>
              </OptionButton>
            </Grid>
          ))}
        </Grid>
      </OptionSection>

      <OptionSection>
        <OptionTitle>
          <OptionIcon>📏</OptionIcon>
          Sleeve Length
        </OptionTitle>
        <Grid container spacing={1}>
          {sleeveLengthOptions.map(option => (
            <Grid size={4} key={option.name}>
              <OptionButton
                active={config.sleeveLength === option.name}
                onClick={() => onUpdate('sleeveLength', option.name)}
              >
                <OptionEmoji>{option.emoji}</OptionEmoji>
                <OptionLabel>{option.label}</OptionLabel>
              </OptionButton>
            </Grid>
          ))}
        </Grid>
      </OptionSection>

      <OptionSection>
        <OptionTitle>
          <OptionIcon>🏷️</OptionIcon>
          Lapel Style
        </OptionTitle>
        <Grid container spacing={1}>
          {lapelStyleOptions.map(option => (
            <Grid size={4} key={option.name}>
              <OptionButton
                active={config.lapelStyle === option.name}
                onClick={() => onUpdate('lapelStyle', option.name)}
              >
                <OptionEmoji>{option.emoji}</OptionEmoji>
                <OptionLabel>{option.label}</OptionLabel>
              </OptionButton>
            </Grid>
          ))}
        </Grid>
      </OptionSection>

      <OptionSection>
        <OptionTitle>
          <OptionIcon>🧵</OptionIcon>
          Fabric
        </OptionTitle>
        <Grid container spacing={1}>
          {fabricOptions.map(option => (
            <Grid size={6} key={option.name}>
              <OptionButton
                active={config.fabric === option.name}
                onClick={() => onUpdate('fabric', option.name)}
              >
                <OptionEmoji>{option.emoji}</OptionEmoji>
                <OptionLabel>{option.label}</OptionLabel>
              </OptionButton>
            </Grid>
          ))}
        </Grid>
      </OptionSection>
    </PanelContainer>
  );
}

export default CustomizationPanel; 