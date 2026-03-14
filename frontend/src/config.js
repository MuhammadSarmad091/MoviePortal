// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// App Configuration
export const APP_NAME = 'MoviesPortal';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  RATINGS: true,
  REVIEWS: true,
  FAVORITES: true,
  WATCHLIST: true,
  SHARING: true
};

// Theme Configuration
export const THEME = {
  darkMode: true,
  primaryColor: '#ffc107',
  secondaryColor: '#1a1a1a'
};
