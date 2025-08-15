import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ModelContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  height: '500px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  margin: '0 auto',
}));

const SuitSVG = styled('svg')({
  width: '100%',
  height: '100%',
  maxWidth: '300px',
  maxHeight: '400px',
  filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))',
  transition: 'all 0.3s ease',
});

const FabricInfo = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(2.5),
  fontSize: '0.9rem',
  fontWeight: 500,
  backdropFilter: 'blur(5px)',
}));

interface SuitConfig {
  color: string;
  buttonStyle: string;
  sleeveLength: string;
  lapelStyle: string;
  fabric: string;
}

interface SuitModelProps {
  config: SuitConfig;
}

function SuitModel({ config }: SuitModelProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  
  const colorMap: Record<string, string> = {
    navy: '#1a1a2e',
    charcoal: '#36454f',
    black: '#0f0f0f',
    brown: '#8b4513'
  };

  useEffect(() => {
    // Load SVG template
    fetch('/assets/suit-template.svg')
      .then(response => response.text())
      .then(data => {
        setSvgContent(data);
      })
      .catch(error => {
        console.error('Error loading SVG template:', error);
      });
  }, []);

  const suitColor = colorMap[config.color] || '#1a1a2e';
  const fabricPattern: Record<string, string> = {
    wool: 'none',
    cotton: 'url(#cottonPattern)',
    silk: 'url(#silkPattern)',
    linen: 'url(#linenPattern)'
  };

  // If SVG is still loading, show a placeholder
  if (!svgContent) {
    return (
      <ModelContainer>
        <div>Loading suit model...</div>
      </ModelContainer>
    );
  }

  // Create a DOM parser to parse the SVG string
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  // Update the SVG based on the config
  const mainJacket = svgDoc.querySelector('path[d^="M200,100"]');
  if (mainJacket) {
    mainJacket.setAttribute('fill', fabricPattern[config.fabric] === 'none' ? 'url(#suitGradient)' : fabricPattern[config.fabric]);
  }
  
  // Update gradient colors based on selected color
  const gradientStops = svgDoc.querySelectorAll('#suitGradient stop');
  gradientStops.forEach(stop => {
    if (stop.getAttribute('stop-color') === '#1a1a2e') {
      stop.setAttribute('stop-color', suitColor);
    }
  });
  
  // Update pattern colors
  const patternRects = svgDoc.querySelectorAll('pattern rect');
  patternRects.forEach(rect => {
    if (rect.getAttribute('fill') === '#1a1a2e') {
      rect.setAttribute('fill', suitColor);
    }
  });
  
  // Show or hide buttons based on button style
  const buttons = svgDoc.querySelectorAll('circle[cy="250"], circle[cy="300"], circle[cy="350"]');
  if (config.buttonStyle === 'single') {
    buttons[0].setAttribute('visibility', 'visible');
    buttons[1].setAttribute('visibility', 'hidden');
    buttons[2].setAttribute('visibility', 'hidden');
  } else if (config.buttonStyle === 'double') {
    buttons[0].setAttribute('visibility', 'visible');
    buttons[1].setAttribute('visibility', 'visible');
    buttons[2].setAttribute('visibility', 'hidden');
  } else {
    buttons[0].setAttribute('visibility', 'visible');
    buttons[1].setAttribute('visibility', 'visible');
    buttons[2].setAttribute('visibility', 'visible');
  }
  
  // Modify lapel style
  const leftLapel = svgDoc.querySelector('path[d="M150,120 L170,180 L160,250 L140,220 L120,150 Z"]');
  const rightLapel = svgDoc.querySelector('path[d="M250,120 L230,180 L240,250 L260,220 L280,150 Z"]');
  
  if (leftLapel && rightLapel) {
    if (config.lapelStyle === 'notched') {
      // Default style is notched, no changes needed
    } else if (config.lapelStyle === 'peaked') {
      leftLapel.setAttribute('d', 'M150,120 L170,180 L180,240 L140,220 L120,150 Z');
      rightLapel.setAttribute('d', 'M250,120 L230,180 L220,240 L260,220 L280,150 Z');
    } else if (config.lapelStyle === 'shawl') {
      leftLapel.setAttribute('d', 'M150,120 C160,150 170,180 160,250 C150,220 130,180 120,150 Z');
      rightLapel.setAttribute('d', 'M250,120 C240,150 230,180 240,250 C250,220 270,180 280,150 Z');
    }
  }

  return (
    <ModelContainer>
      <div dangerouslySetInnerHTML={{ __html: svgDoc.documentElement.outerHTML }} />
      
      <FabricInfo>
        {config.fabric.charAt(0).toUpperCase() + config.fabric.slice(1)} - {config.color.charAt(0).toUpperCase() + config.color.slice(1)}
      </FabricInfo>
    </ModelContainer>
  );
}

export default SuitModel; 