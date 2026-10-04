import React from 'react';

/**
 * Header Component for CloudShield Dashboard
 * Contained rectangular enterprise header card with defined border, logo, title, theme toggle, and refresh button.
 */
export default function Header({ onRefresh, loading, isDarkMode, onToggleTheme }) {
  return (
    <header className="header-container-card">
      <div className="header-left">
        <div className="header-logo-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="header-title-box">
          <span className="header-app-name">CloudShield</span>
          <span className="header-subtitle">AWS Fault Injection & Resilience</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-badge">
          <span className="header-badge-dot"></span>
          <span>Cloud Resilience</span>
        </div>

        {/* Theme Toggle Button (Icon Only, No Box, No Text) */}
        <button
          className="btn-theme-toggle"
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button 
          id="refresh-status-btn"
          className="btn-refresh" 
          onClick={onRefresh} 
          disabled={loading}
          title="Refresh status from backend"
        >
          {loading ? (
            <>
              <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Refresh Status</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
