/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#effaf5',
          '100': '#d9f2e6',
          '200': '#b7e6d0',
          '300': '#8ad5b6',
          '400': '#5ec099',
          '500': '#3eb182',
          '600': '#2f8a67',
          '700': '#266c52',
          '800': '#215643',
          '900': '#1d4738',
          '950': '#0f261e',
        },
        'secondary': {
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
          '800': '#92400e',
          '900': '#78350f',
          '950': '#451a03',
        },
      },
      fontFamily: {
        solaimanlipi: ["SolaimanLipi", "sans-serif"],
      }
    },
  },
  plugins: [],
}

