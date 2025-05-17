/**
 * Theme management for the Chatter application
 */

// Theme constants
const THEME_KEY = 'chatter_theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

// Set theme based on preference
function setTheme(theme) {
  // Update data attribute on document
  document.documentElement.setAttribute('data-theme', theme);
  
  // Store theme preference in localStorage
  localStorage.setItem(THEME_KEY, theme);
  
  // Update theme toggle buttons
  updateThemeToggleButtons(theme);
}

// Update all theme toggle buttons on the page
function updateThemeToggleButtons(theme) {
  const themeToggles = document.querySelectorAll('#theme-toggle');
  
  themeToggles.forEach(toggle => {
    const icon = toggle.querySelector('i');
    
    if (theme === DARK_THEME) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });
}

// Toggle between light and dark theme
function toggleTheme() {
  const currentTheme = localStorage.getItem(THEME_KEY) || LIGHT_THEME;
  const newTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
  
  setTheme(newTheme);
}

// Initialize theme
function initTheme() {
  // Get stored theme or default to light
  const storedTheme = localStorage.getItem(THEME_KEY) || LIGHT_THEME;
  
  // Apply theme
  setTheme(storedTheme);
  
  // Add event listeners to theme toggle buttons
  const themeToggles = document.querySelectorAll('#theme-toggle');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleTheme);
  });
}

// Initialize theme on DOM content loaded
document.addEventListener('DOMContentLoaded', initTheme);