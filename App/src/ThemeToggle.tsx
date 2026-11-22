import { useState } from 'react';

type Theme = 'light' | 'dark';
const storageKey = 'jedeyafola.theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#160b07' : '#fdf4ed');
}

export function initializeTheme() {
  let theme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* Use the system preference when browser storage is unavailable. */ }
  applyTheme(theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  function toggleTheme() {
    applyTheme(nextTheme);
    setTheme(nextTheme);
    try { localStorage.setItem(storageKey, nextTheme); }
    catch { /* The switch still works for this visit without browser storage. */ }
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {theme === 'dark'
          ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
          : <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />}
      </svg>
      <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
