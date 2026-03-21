import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all duration-300 group relative overflow-hidden"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            <div className="relative z-10 flex items-center justify-center">
                {theme === 'light' ? (
                    <Moon size={16} className="group-hover:rotate-12 transition-transform duration-500" />
                ) : (
                    <Sun size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
    );
};

export default ThemeToggle;
