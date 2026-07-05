'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * BlurText - smooth blur and opacity character reveal entrance.
 */
export function BlurText({ text = '', delay = 0, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ filter: 'blur(12px)', opacity: 0, y: 12 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mr-2"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * ShinyText - text shimmering glow sweep effect.
 */
export function ShinyText({ children, className = '', speed = '5s' }) {
  return (
    <span
      className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-text-shine ${className}`}
      style={{ animationDuration: speed }}
    >
      {children}
    </span>
  );
}

/**
 * SpotlightCard - Linear-like card with ambient cursor tracking spotlight highlights.
 */
export function SpotlightCard({ children, className = '', ...props }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm transition-all duration-300 ${className}`}
      style={{
        '--x': `${position.x}px`,
        '--y': `${position.y}px`,
        '--spotlight-opacity': opacity,
      }}
      {...props}
    >
      {/* Border Spotlight Radial Highlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl border border-primary/10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(120px circle at var(--x) var(--y), rgba(8, 145, 178, 0.15), transparent 80%)`,
          opacity: `var(--spotlight-opacity)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * CountUp - React count animation.
 */
export function CountUp({ end = 0, duration = 1200, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}
