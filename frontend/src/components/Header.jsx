// src/components/Header.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function Header({ onGetStarted, theme, setTheme }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo-mark">⚡</div>
        <div className="logo-text">NEXORA</div>
      </div>

      <div className="header-actions">
        <button className="btn-ghost" onClick={onGetStarted}>Get Started</button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="btn-theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </motion.button>
      </div>
    </header>
  );
}
