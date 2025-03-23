/**
 * Utility to get Tailwind colors for charts
 * This simplifies using Tailwind colors in chart components
 */

// Brand colors mapped from edays brand guidelines
const tailwindColors = {
  // Blue scale
  'blue-10': '#030D17', // L5
  'blue-20': '#0B2745', // L15
  'blue-30': '#0D4273', // L25
  'blue-40': '#125CA1', // L35
  'blue-50': '#1776CF', // L45
  'blue-60': '#309DEB', // L55
  'blue-70': '#5EABED', // L65
  'blue-80': '#8CC1F2', // L75
  'blue-90': '#BADAF7', // L85
  'blue-100': '#E8F3FC', // L95
  
  // Rose scale
  'rose-10': '#17030D', // L5
  'rose-20': '#440826', // L15
  'rose-30': '#710F40', // L25
  'rose-40': '#9E1559', // L35
  'rose-50': '#CB1A73', // L45
  'rose-60': '#E5348C', // L55
  'rose-70': '#EA61A6', // L65
  'rose-80': '#F08EBF', // L75
  'rose-90': '#F6BBD9', // L85
  'rose-100': '#FCE8F2', // L95
  
  // Green scale
  'green-10': '#06130B', // L5
  'green-20': '#133920', // L25
  'green-30': '#205F35', // L35
  'green-40': '#2DB54A', // L45
  'green-50': '#3AAB50', // L55
  'green-60': '#54C579', // L65
  'green-70': '#7AD297', // L75
  'green-80': '#A0DFB5', // L85
  'green-90': '#C5ECD2', // L95
  'green-100': '#ECF9F0', // L95
  
  // Purple scale
  'purple-10': '#0A0713', // L5
  'purple-20': '#1D1439', // L15
  'purple-30': '#31215E', // L25
  'purple-40': '#442E84', // L35
  'purple-50': '#583CAA', // L45
  'purple-60': '#715CC3', // L55
  'purple-70': '#917BD1', // L65
  'purple-80': '#B0A1DE', // L75
  'purple-90': '#D0C6EB', // L85
  'purple-100': '#EFECF8', // L95
  
  // Orange scale
  'orange-10': '#1A0E00', // L5
  'orange-20': '#4D2900', // L15
  'orange-30': '#804500', // L25
  'orange-40': '#B26100', // L35
  'orange-50': '#E57C00', // L45
  'orange-60': '#FF961A', // L55
  'orange-70': '#FFB052', // L65
  'orange-80': '#FFC98A', // L75
  'orange-90': '#FFE3C2', // L85
  'orange-100': '#FFF6EB', // L95
  
  // Teal scale
  'teal-10': '#061312', // L5
  'teal-20': '#133A37', // L15
  'teal-30': '#1F605C', // L25
  'teal-40': '#2C8781', // L35
  'teal-50': '#38ADA5', // L45
  'teal-60': '#52C7BF', // L55
  'teal-70': '#78D3CD', // L65
  'teal-80': '#9FE0DB', // L75
  'teal-90': '#C5ECEA', // L85
  'teal-100': '#ECF9F8', // L95
  
  // Grey scale (custom increments as per brand guide)
  'grey-10': '#16161F', // L10
  'grey-20': '#2D2E3E', // L21
  'grey-30': '#47485D', // L32
  'grey-40': '#61627A', // L43
  'grey-50': '#7D7F99', // L55
  'grey-60': '#939AAD', // L63
  'grey-70': '#ACADC3', // L72
  'grey-80': '#C4C5D7', // L80
  'grey-90': '#DDDEEB', // L89
  'grey-100': '#F0F0F7', // L96
  
  // Legacy semantic colors (mapped to appropriate new colors)
  'green-500': '#3AAB50', // mapped to green-50
  'yellow-500': '#FFB052', // mapped to orange-70
  'orange-500': '#E57C00', // mapped to orange-50
  'red-500': '#E5348C',   // mapped to rose-60
};

/**
 * Get color by Tailwind class name
 * e.g. getTailwindColor('blue-500')
 */
export const getTailwindColor = (colorName: string): string => {
  return tailwindColors[colorName as keyof typeof tailwindColors] || '#000000';
};

/**
 * Get a color with opacity
 * e.g. getTailwindColorWithOpacity('blue-500', 0.5)
 */
export const getTailwindColorWithOpacity = (colorName: string, opacity: number): string => {
  const hex = getTailwindColor(colorName);
  
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Export the tailwind colors for direct access if needed
export { tailwindColors };
