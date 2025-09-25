import { heroui } from '@heroui/react';

const herouiConfig = heroui({
  layout: {
    disabledOpacity: '0.3', // opacity-[0.3]
    radius: {
      small: '2px', // rounded-small
      medium: '4px', // rounded-medium
      large: '6px', // rounded-large
    },
    borderWidth: {
      small: '1px', // border-small
      medium: '1px', // border-medium
      large: '2px', // border-large
    },
  },
  themes: {
    light: {},
    dark: {
      colors: {
        primary: {
          DEFAULT: '#BEF264',
          foreground: '#000000',
        },
        focus: '#BEF264',
      },
    },
    'purple-dark': {
      extend: 'dark',
      colors: {
        background: '#0D001A',
        foreground: '#FFFFFF',
        primary: {
          50: '#3B096C',
          100: '#520F83',
          200: '#7318A2',
          300: '#9823C2',
          400: '#C031E2',
          500: '#DD62ED',
          600: '#F182F6',
          700: '#FCADF9',
          800: '#FDD5F9',
          900: '#FEECFE',
          DEFAULT: '#DD62ED',
          foreground: '#FFFFFF',
        },
        focus: '#F182F6',
      },
    },
  },
});

export default herouiConfig;
