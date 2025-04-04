"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}

export const SparklesCore = ({
  id = "tsparticles",
  className = "",
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 100,
  particleColor = "#4FACFE",
}: SparklesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particles: { x: number; y: number; size: number }[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      if (containerRef.current && ctx) {
        width = containerRef.current.offsetWidth;
        height = containerRef.current.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
      }
    };

    const initParticles = () => {
      particles.length = 0;
      const particleCount = Math.floor((width * height) / (10000 / particleDensity));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: minSize + Math.random() * (maxSize - minSize),
        });
      }
    };

    const drawParticles = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = particleColor;
      
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        particle.y -= 0.2;
        if (particle.y < -particle.size) {
          particle.y = height + particle.size;
          particle.x = Math.random() * width;
        }
      });
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    if (containerRef.current) {
      containerRef.current.appendChild(canvas);
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
      drawParticles();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.remove();
    };
  }, [minSize, maxSize, particleDensity, particleColor]);

  return (
    <motion.div
      ref={containerRef}
      id={id}
      className={className}
      style={{ background }}
    />
  );
}; 