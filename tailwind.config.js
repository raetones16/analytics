/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1800px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Edays Brand Colors
        blue: {
          '10': '#030D17',
          '20': '#0B2745',
          '30': '#0D4273',
          '40': '#125CA1',
          '50': '#1776CF',
          '60': '#309DEB',
          '70': '#5EABED',
          '80': '#8CC1F2',
          '90': '#BADAF7',
          '100': '#E8F3FC',
        },
        rose: {
          '10': '#17030D',
          '20': '#440826',
          '30': '#710F40',
          '40': '#9E1559',
          '50': '#CB1A73',
          '60': '#E5348C',
          '70': '#EA61A6',
          '80': '#F08EBF',
          '90': '#F6BBD9',
          '100': '#FCE8F2',
        },
        green: {
          '10': '#06130B',
          '20': '#133920',
          '30': '#205F35',
          '40': '#2DB54A',
          '50': '#3AAB50',
          '60': '#54C579',
          '70': '#7AD297',
          '80': '#A0DFB5',
          '90': '#C5ECD2',
          '100': '#ECF9F0',
        },
        purple: {
          '10': '#0A0713',
          '20': '#1D1439',
          '30': '#31215E',
          '40': '#442E84',
          '50': '#583CAA',
          '60': '#715CC3',
          '70': '#917BD1',
          '80': '#B0A1DE',
          '90': '#D0C6EB',
          '100': '#EFECF8',
        },
        orange: {
          '10': '#1A0E00',
          '20': '#4D2900',
          '30': '#804500',
          '40': '#B26100',
          '50': '#E57C00',
          '60': '#FF961A',
          '70': '#FFB052',
          '80': '#FFC98A',
          '90': '#FFE3C2',
          '100': '#FFF6EB',
        },
        teal: {
          '10': '#061312',
          '20': '#133A37',
          '30': '#1F605C',
          '40': '#2C8781',
          '50': '#38ADA5',
          '60': '#52C7BF',
          '70': '#78D3CD',
          '80': '#9FE0DB',
          '90': '#C5ECEA',
          '100': '#ECF9F8',
        },
        grey: {
          '10': '#16161F', 
          '20': '#2D2E3E',
          '30': '#47485D',
          '40': '#61627A',
          '50': '#7D7F99',
          '60': '#939AAD',
          '70': '#ACADC3',
          '80': '#C4C5D7',
          '90': '#DDDEEB',
          '100': '#F0F0F7',
        },
        // Base colors for backward compatibility
        gray: {
          '50': '#F0F0F7',  // Grey-100
          '100': '#DDDEEB', // Grey-90
          '200': '#C4C5D7', // Grey-80
          '300': '#ACADC3', // Grey-70
          '400': '#939AAD', // Grey-60
          '500': '#7D7F99', // Grey-50
          '600': '#61627A', // Grey-40
          '700': '#47485D', // Grey-30
          '800': '#2D2E3E', // Grey-20
          '900': '#16161F', // Grey-10
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}