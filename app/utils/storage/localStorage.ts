// Local storage utility functions

// Key for storing visualization preferences
export const VISUALIZATION_PREFS_KEY = 'analytics_visualization_preferences';

// Save preferences to localStorage
export function saveVisualizationPreferences(preferences: Record<string, string>): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISUALIZATION_PREFS_KEY, JSON.stringify(preferences));
    }
  } catch (error) {
    console.error('Failed to save visualization preferences:', error);
  }
}

// Load preferences from localStorage
export function loadVisualizationPreferences(): Record<string, string> {
  try {
    if (typeof window !== 'undefined') {
      const storedPrefs = localStorage.getItem(VISUALIZATION_PREFS_KEY);
      if (storedPrefs) {
        return JSON.parse(storedPrefs);
      }
    }
  } catch (error) {
    console.error('Failed to load visualization preferences:', error);
  }
  return {};
}
