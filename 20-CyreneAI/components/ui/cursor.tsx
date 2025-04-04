'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
}

export const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const updateTrail = useCallback((x: number, y: number) => {
    setTrail(prevTrail => {
      // Keep only the last 12 positions for the trail
      const newTrail = [...prevTrail, { x, y, opacity: 1 }].slice(-12);
      
      // Update opacity for each dot
      return newTrail.map((dot, index) => ({
        ...dot,
        opacity: (index + 1) / newTrail.length // Gradually increase opacity
      }));
    });
  }, []);

  useEffect(() => {
    let frameId: number;
    let prevX = 0;
    let prevY = 0;
    
    const smoothMove = (targetX: number, targetY: number) => {
      // Smooth interpolation
      prevX += (targetX - prevX) * 0.3;
      prevY += (targetY - prevY) * 0.3;
      
      setPosition({ x: prevX, y: prevY });
      updateTrail(prevX, prevY);
      
      frameId = requestAnimationFrame(() => smoothMove(targetX, targetY));
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!frameId) {
        prevX = e.clientX;
        prevY = e.clientY;
      }
      
      const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
      const isClickable = hoveredElement?.matches('button, a, input, textarea, [role="button"]');
      
      // Check if hovering over any wallet adapter related elements
      const isOverWalletModal = 
        hoveredElement?.closest('.wallet-adapter-modal') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-wrapper') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-container') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-overlay') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-button-close') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-title') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-list') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-list-more') !== null ||
        hoveredElement?.closest('.wallet-adapter-modal-list-more-icon') !== null ||
        // Add Web3Modal selectors based on inspection
        hoveredElement?.closest('#w3m-modal') !== null ||
        hoveredElement?.closest('.w3m-modal') !== null ||
        hoveredElement?.closest('w3m-modal') !== null ||
        hoveredElement?.closest('wui-card[role="alertdialog"]') !== null ||
        hoveredElement?.closest('[data-testid="w3m-modal-overlay"]') !== null ||
        hoveredElement?.closest('[data-testid="w3m-modal-card"]') !== null ||
        hoveredElement?.closest('wui-flex') !== null ||
        hoveredElement?.closest('w3m-header') !== null ||
        hoveredElement?.closest('w3m-router') !== null ||
        hoveredElement?.closest('w3m-snackbar') !== null ||
        hoveredElement?.closest('w3m-alertbar') !== null;
      
      setIsPointer(!!isClickable);
      
      // Hide custom cursor when over wallet modal elements
      if (isOverWalletModal) {
        setIsVisible(false);
        document.body.style.cursor = 'auto'; // Restore default cursor
      } else {
        setIsVisible(true);
        document.body.style.cursor = 'none'; // Hide default cursor
      }
      
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => smoothMove(e.clientX, e.clientY));
    };

    // Set initial cursor state
    document.body.style.cursor = 'none';

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
      document.body.style.cursor = 'auto'; // Restore default cursor on unmount
    };
  }, [updateTrail]);

  if (!isVisible) return null;

  return (
    <>
      {/* Comet Trail */}
      {trail.map((dot, index) => (
        <motion.div
          key={index}
          className="fixed pointer-events-none cursor-element z-[100001]"
          style={{
            x: dot.x - (2 + index * 0.5), // Gradually increase size
            y: dot.y - (2 + index * 0.5),
            opacity: dot.opacity * 0.3, // Fade out trail
            width: 4 + index * 1, // Gradually increase size
            height: 4 + index * 1,
            background: 'white',
            borderRadius: '50%',
            filter: `blur(${index * 0.8}px)`, // Gradually increase blur
            transform: `scale(${1 - index * 0.05})`, // Gradually decrease size
          }}
        />
      ))}

      {/* Main Cursor */}
      <motion.div
        className="fixed pointer-events-none cursor-element z-[100001]"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.1,
        }}
      >
        <div 
          className={`w-2 h-2 bg-white rounded-full ${isPointer ? 'mix-blend-difference' : ''}`}
          style={{
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)'
          }}
        />
      </motion.div>
      
      {/* Cursor Ring */}
      <motion.div
        className="fixed pointer-events-none cursor-element z-[100001]"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.15,
        }}
      >
        <div className="w-8 h-8 border border-white rounded-full opacity-25" />
      </motion.div>
    </>
  );
}; 