import React from 'react';
import { Typography, Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

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
      <Typography variant={variant} sx={titleSx} className={sizeClass}>
        <span className="relative inline-block z-10">{text}</span>
        <span
          className="absolute bottom-[-10px] left-0 w-full h-[3px] bg-primary transform scale-x-0 origin-center transition-transform duration-500 ease-in-out opacity-60 hover:scale-x-100"
          style={{
            transformOrigin: align === 'left' ? 'left' : align === 'right' ? 'right' : 'center',
            backgroundColor: '#00a1cc'
          }}
        />
      </Typography>
       
    </Box>
  );
};

export default PageTitle;