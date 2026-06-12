/** Toggle between light/dark theme and persist the choice. */
export function toggleTheme(): void {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  const next = isDark ? 'light' : 'dark';
  html.classList.remove('dark', 'light');
  html.classList.add(next);
  try {
    localStorage.setItem('theme', next);
  } catch {
    // localStorage may be blocked in some environments
  }
}

/** Read the current theme from the html element. */
export function getTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}
