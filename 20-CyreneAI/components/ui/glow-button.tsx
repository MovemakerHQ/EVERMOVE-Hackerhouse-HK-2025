import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GlowButton = ({ children, ...props }: GlowButtonProps) => (
  <button
    {...props}
    style={{
      ...props.style,
      border: 'none',
      outline: 'none',
      color: 'white',
      background: '#111',
      cursor: 'pointer',
      position: 'relative',
      zIndex: 0,
      userSelect: 'none',
      padding: '5px 10px',
      borderRadius: '10px',
    }}
    className="relative"
  >
    <span
      style={{
        position: 'absolute',
        content: '""',
        background: 'linear-gradient(45deg, #0162FF, white, #A63FE1, #0162FF)',
        top: '-2px',
        left: '-2px',
        backgroundSize: '400%',
        zIndex: -1,
        filter: 'blur(5px)',
        width: 'calc(100% + 4px)',
        height: 'calc(100% + 4px)',
        animation: 'glowing-button 20s linear infinite',
        transition: 'opacity 0.3s ease-in-out',
        borderRadius: 'inherit',
      }}
    />
    <span
      style={{
        position: 'absolute',
        content: '""',
        zIndex: -1,
        width: '100%',
        height: '100%',
        background: '#111',
        left: '0',
        top: '0',
        borderRadius: 'inherit',
      }}
    />
    {children}
  </button>
); 