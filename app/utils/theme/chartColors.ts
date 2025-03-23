/**
 * Chart colors utility - maps Tailwind colors to chart elements
 * Uses Tailwind colors for consistent theming with standardized naming
 */
import { getTailwindColor } from './tailwindColors';

// Primary chart colors from our edays brand theme
export const chartColors = {
  primary: getTailwindColor('blue-50'),       // Primary brand color - Blue L45
  secondary: getTailwindColor('grey-50'),     // Secondary color - Grey L55
  accent: getTailwindColor('teal-50'),        // Accent color - Teal L45
  muted: getTailwindColor('grey-40'),         // Muted text/borders - Grey L43
  background: getTailwindColor('grey-100'),   // Background color - Grey L96
  foreground: getTailwindColor('grey-10'),    // Text color - Grey L10
  destructive: getTailwindColor('rose-50'),   // Error/destructive color - Rose L45
};

// Standardized chart color palette - numbered for easy reference using brand colors
export const chartPalette = {
  color1: getTailwindColor('blue-50'),      // Blue L45 - Primary brand color
  color2: getTailwindColor('teal-50'),      // Teal L45 - Accent color
  color3: getTailwindColor('green-50'),     // Green L45 - Success/positive color
  color4: getTailwindColor('orange-70'),    // Orange L65 - Warning/neutral color
  color5: getTailwindColor('orange-50'),    // Orange L45 - Caution color
  color6: getTailwindColor('rose-50'),      // Rose L45 - Error/negative color
  color7: getTailwindColor('purple-50'),    // Purple L45 - Additional color
  color8: getTailwindColor('teal-60'),      // Teal L55 - Additional color (slightly brighter)
  color9: getTailwindColor('blue-60'),      // Blue L55 - Additional color (slightly brighter)
  color10: getTailwindColor('purple-60'),   // Purple L55 - Additional color (slightly brighter)
};

// Color schemes for different chart types - using edays brand colors
export const chartColorSchemes = {
  // For bar charts, area charts, etc.
  categorical: [
    chartPalette.color1,
    chartPalette.color2,
    chartPalette.color3,
    chartPalette.color4,
    chartPalette.color5,
    chartPalette.color6,
    chartPalette.color7,
    chartPalette.color8,
    chartPalette.color9,
    chartPalette.color10,
  ],
  
  // For sequential data (low to high)
  sequential: [
    getTailwindColor('blue-70'),
    getTailwindColor('blue-60'), 
    getTailwindColor('blue-50'),
    getTailwindColor('blue-40'),
    getTailwindColor('blue-30'),
  ],
  
  // For diverging data (negative to positive)
  diverging: [
    getTailwindColor('rose-50'),     // Rose L45 (negative)
    getTailwindColor('orange-50'),    // Orange L45
    getTailwindColor('orange-70'),    // Orange L65 (neutral)
    getTailwindColor('green-60'),     // Green L55 
    getTailwindColor('green-50'),     // Green L45 (positive)
  ],

  // Monochromatic blues
  blues: [
    getTailwindColor('blue-90'),
    getTailwindColor('blue-70'),
    getTailwindColor('blue-50'),
    getTailwindColor('blue-30'),
    getTailwindColor('blue-10'),
  ],

  // Monochromatic greens
  greens: [
    getTailwindColor('green-90'),
    getTailwindColor('green-70'),
    getTailwindColor('green-50'),
    getTailwindColor('green-30'),
    getTailwindColor('green-10'),
  ],
  
  // Monochromatic teals
  teals: [
    getTailwindColor('teal-90'),
    getTailwindColor('teal-70'),
    getTailwindColor('teal-50'),
    getTailwindColor('teal-30'),
    getTailwindColor('teal-10'),
  ],
  
  // Monochromatic purples
  purples: [
    getTailwindColor('purple-90'),
    getTailwindColor('purple-70'),
    getTailwindColor('purple-50'),
    getTailwindColor('purple-30'),
    getTailwindColor('purple-10'),
  ]
};

// Map our product-specific colors to the standard palette
export const appColorsMapped = {
  web: getTailwindColor('blue-50'),     // Web app uses blue L45 (primary)
  mobile: getTailwindColor('teal-50'),  // Mobile app uses teal L45 (accent)
};

// Map sales categories to standard palette
export const categoryColorsMapped = {
  newDirect: getTailwindColor('blue-50'),      // Blue L45 (primary)
  newPartner: getTailwindColor('teal-50'),     // Teal L45 (accent)
  existingClient: getTailwindColor('orange-60'), // Orange L55 
  existingPartner: getTailwindColor('purple-50'), // Purple L45
  selfService: getTailwindColor('orange-50'),    // Orange L45
};

// Map severity colors to standard palette with semantic meanings
export const severityColorsMapped = {
  low: getTailwindColor('green-50'),      // Green L45 (Success)
  medium: getTailwindColor('orange-70'),  // Orange L65 (Warning)
  high: getTailwindColor('orange-50'),    // Orange L45 (Caution)
  urgent: getTailwindColor('rose-50'),    // Rose L45 (Danger)
};

// Default color array for charts that need it (like pie charts)
export const COLORS_MAPPED = chartColorSchemes.categorical;
