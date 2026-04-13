import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      data-testid="theme-toggle"
      onClick={() => setDarkMode(!darkMode)}
      className="w-9 h-9 rounded-md border flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-secondary)',
      }}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
