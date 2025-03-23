/**
 * UI component theme colors that map to our standardized palette
 */
import { chartPalette } from './chartColors';

// UI theme mapping for common components using edays brand colors
export const uiColors = {
  // Primary action/selected state (uses blue L45-L95)
  primary: {
    bg: 'bg-blue-50',       // Blue L45 
    bgLight: 'bg-blue-90',   // Blue L85
    text: 'text-blue-30',      // Blue L25
    border: 'border-blue-70', // Blue L65
    hover: 'hover:bg-blue-80', // Blue L75
  },
  
  // Information (uses blue family)
  info: {
    bg: 'bg-blue-90',      // Blue L85
    border: 'border-blue-60', // Blue L55
    text: 'text-blue-30',    // Blue L25
  },
  
  // Warning (uses orange family)
  warning: {
    bg: 'bg-orange-90',      // Orange L85
    border: 'border-orange-60', // Orange L55
    text: 'text-orange-30',    // Orange L25
  },
  
  // Error (uses rose family)
  error: {
    bg: 'bg-rose-90',       // Rose L85
    border: 'border-rose-60', // Rose L55
    text: 'text-rose-30',     // Rose L25
  },
  
  // Success (uses green family)
  success: {
    bg: 'bg-green-90',       // Green L85
    border: 'border-green-60', // Green L55
    text: 'text-green-30',     // Green L25
  },
  
  // Default/Inactive state (grey)
  default: {
    bg: 'bg-grey-90',        // Grey L89
    text: 'text-grey-30',      // Grey L32
    border: 'border-grey-60',  // Grey L63
    hover: 'hover:bg-grey-80', // Grey L80
  }
};
