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
  destructive: getTailwindColor('rose-60'),   // Updated to Rose L60 (was L45) - Error/destructive
};

// Standardized chart color palette - numbered for easy reference using brand colors
export const chartPalette = {
  color1: getTailwindColor('blue-50'),      // Blue L45 - Primary brand color
  color2: getTailwindColor('rose-60'),      // Rose L60 - Now second color for better distinction
  color3: getTailwindColor('orange-70'),    // Orange L65 - Third color
  color4: getTailwindColor('teal-50'),      // Teal L45 - Moved from second to fourth position
  color5: getTailwindColor('purple-60'),    // Purple L60 - Fifth color
  color6: getTailwindColor('green-50'),     // Green L45 - Moved from third to sixth position
  color7: getTailwindColor('grey-50'),      // Grey L50 - Seventh color (new addition)
  color8: getTailwindColor('blue-70'),      // Blue L70 - Eighth color (different shade of blue)
  color9: getTailwindColor('orange-50'),    // Orange L50 - Ninth color (different shade of orange)
  color10: getTailwindColor('teal-70'),     // Teal L70 - Tenth color (different shade of teal)
};

// Color schemes for different chart types - using edays brand colors
export const chartColorSchemes = {
  // For bar charts, area charts, etc.
  categorical: [
    chartPalette.color1, // Blue 50
    chartPalette.color2, // Rose 60
    chartPalette.color3, // Orange 70
    chartPalette.color4, // Teal 50
    chartPalette.color5, // Purple 60
    chartPalette.color6, // Green 50
    chartPalette.color7, // Grey 50
    chartPalette.color8, // Blue 70
    chartPalette.color9, // Orange 50
    chartPalette.color10, // Teal 70
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
    getTailwindColor('rose-60'),     // Rose L60 (negative)
    getTailwindColor('orange-50'),    // Orange L50
    getTailwindColor('grey-50'),     // Grey L50 (neutral) - changed from duplicate orange
    getTailwindColor('teal-50'),     // Teal L50 - changed from green 
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
  existingClient: getTailwindColor('orange-70'), // Orange L70
  existingPartner: getTailwindColor('rose-60'), // Rose L60
  selfService: getTailwindColor('purple-60'),   // Purple L60 (was orange-70)
};

// Map severity colors to standard palette with semantic meanings
export const severityColorsMapped = {
  low: getTailwindColor('green-50'),      // Green L45 (Success)
  medium: getTailwindColor('orange-70'),  // Orange L65 (Warning)
  high: getTailwindColor('orange-50'),    // Orange L50 - Changed to avoid duplicate
  urgent: getTailwindColor('rose-60'),    // Rose L60 (Danger)
};

// Default color array for charts that need it (like pie charts)
export const COLORS_MAPPED = chartColorSchemes.categorical;
