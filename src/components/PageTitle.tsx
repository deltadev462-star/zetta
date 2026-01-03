import React from 'react';
import { Typography, Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface PageTitleProps {
  text: string;
  align?: 'left' | 'center' | 'right';
  subtitle?: string;
  glowEffect?: boolean;
  gradientText?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
  text,
  align = 'center',
  subtitle,
  glowEffect = true,
  gradientText = false,
  size = 'large',
  className = ''
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  // Size mappings for MUI Typography variant and Tailwind classes
  const sizeConfig = {
    small: { variant: 'h4' as const, className: 'text-3xl md:text-4xl' },
    medium: { variant: 'h3' as const, className: 'text-4xl md:text-5xl' },
    large: { variant: 'h2' as const, className: 'text-5xl md:text-6xl lg:text-7xl' },
    xlarge: { variant: 'h1' as const, className: 'text-6xl md:text-7xl lg:text-8xl' },
  };

  const { variant, className: sizeClass } = sizeConfig[size];

  // MUI sx props for styling
  const titleSx: SxProps<Theme> = {
    fontWeight: 400,  
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    position: 'relative',
    display: 'inline-block',
    animation: 'titleReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(glowEffect && !gradientText && {
      color: '#00a1cc',
      textShadow: `
        0 0 20px rgba(0, 161, 204, 0.3),
        0 0 40px rgba(0, 161, 204, 0.2)
      `,
      '&:hover': {
        textShadow: `
          0 0 25px rgba(0, 161, 204, 0.4),
          0 0 50px rgba(0, 161, 204, 0.3)
        `,
        transform: 'translateY(-2px)',
      },
    }),
    ...(gradientText && {
      color: '#00a1cc',
      fontWeight: 900,
    }),
  };

  const containerSx: SxProps<Theme> = {
    position: 'relative',
    marginBottom: '3rem',
    padding: '2rem 0',
    width: '100%',
    overflow: 'hidden',
    textAlign: align,
   
  };

 
  return (
    <Box sx={containerSx} className={className}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Typography variant={variant} sx={titleSx} className={sizeClass}>
          {text}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10px',
            [isRTL ? 'right' : 'left']: 0,
            width: '100%',
            height: '3px',
            backgroundColor: '#00a1cc',
            transform: 'scaleX(0)',
            transformOrigin: isRTL
              ? (align === 'left' ? 'right' : align === 'right' ? 'left' : 'center')
              : (align === 'left' ? 'left' : align === 'right' ? 'right' : 'center'),
            transition: 'transform 0.5s ease-in-out',
            opacity: 0.6,
            '&:hover': {
              transform: 'scaleX(1)',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default PageTitle;