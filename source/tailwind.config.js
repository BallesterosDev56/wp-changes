import {
  scopedPreflightStyles,
  isolateInsideOfContainer,
} from "tailwindcss-scoped-preflight";

/** @type {import('tailwindcss').Config} */
module.exports = {
  /* corePlugins: {
    preflight: false,
  }, */
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /col-start-(1|2|3|4|5)/,
      variants: ["md"],
    },
    {
      pattern: /row-start-(1|2|3|4|5)/,
      variants: ["md"],
    },
    {
      pattern: /col-span-(1|2|3|4|5)/,
      variants: ["md"],
    },
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#222251",
          0: "#000",
          10: "#0E0713",
          20: "#1A1029",
          30: "#161635",
          40: "#222251",
          50: "#535C6C",
          60: "#616977",
          70: "#727E87",
          80: "#919EA2",
          90: "#B1BCBD",
        },
        secondary: {
          DEFAULT: "#31CCDA",
          0: "#131973",
          10: "#193A8E",
          20: "#2063A8",
          30: "#2894C1",
          40: "#2EC2CF",
          50: "#31CCDA",
          60: "#46CDE1",
          70: "#5CCFE7",
          80: "#A2DCF5",
          90: "#BAE3F9",
        },
        tertiary: {
          DEFAULT: "#01BD5B",
          0: "#004265",
          10: "#006D7C",
          20: "#009384",
          30: "#00A874",
          40: "#01BD5B",
          50: "#0CC36B",
          60: "#19C97B",
          70: "#25CF8A",
          80: "#31D499",
          90: "#4ADEB5",
        },
        neutral: {
          0: "#7C7E80",
          10: "#8A8D8F",
          20: "#999B9E",
          30: "#A7AAAC",
          40: "#B6B8BB",
          50: "#C4C7CA",
          60: "#D2D5D9",
          70: "#E1E4E7",
          80: "#EFF2F6",
          90: "#F4F4F4",
          white: "#FFF",
        },
        error: {
          DEFAULT: '#CE1C00',
          0: '#850500',
          10: '#9D0B00',
          20: '#B61300',
          30: '#CE1C00',
          40: '#E72600',
          50: '#FF3100',
          60: '#E6501E',
          70: '#CE683B',
          80: '#B77A57',
          90: '#CF9B7E',
        },
        success: '#01BD5B',
        //warning: ''
        dark: {
          0: "#171923",
          10: "#212330",
          20: "#2A2D3D",
          30: "#303343" /*
          40: '#B6B8BB',
          50: '#C4C7CA',
          60: '#D2D5D9',
          70: '#E1E4E7',
          80: '#EFF2F6',
          90: '#F4F4F4', */,
        },
      },
      fontFamily: {
        futura: ['Futura', 'sans-serif'],
        euclid: ['Euclid', 'sans-serif'],
        neutraface: ["Neutraface", "sans-serif"],
        "priva-one": ["PrivaOne", "sans-serif"],
        "priva-two": ["PrivaTwo", "sans-serif"],
        "priva-three": ["PrivaThree", "sans-serif"],
        "priva-four": ["PrivaFour", "sans-serif"],
        work: ["WorkSans", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      fill: (theme) => ({
        ...theme('colors'),
        current: 'currentColor',
      }),
      stroke: (theme) => ({
        ...theme('colors'),
        current: 'currentColor',
      }),
    },
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer([".tw-class", "#tw-id"]),
    }),
  ],
};
