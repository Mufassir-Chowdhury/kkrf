/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#f0f4f8',
          '100': '#d9e2ec',
          '200': '#bcccdc',
          '300': '#9fb3c8',
          '400': '#69809b',
          '500': '#486581',
          '600': '#334e68',
          '700': '#243b53',
          '800': '#17293c',
          '900': '#102a43',
          '950': '#0a1929',
        },
        'secondary': {
          '50': '#fdf8ee',
          '100': '#faedcc',
          '200': '#f4d896',
          '300': '#edbe5a',
          '400': '#e6a730',
          '500': '#c8871f',
          '600': '#a66a18',
          '700': '#845017',
          '800': '#6c4118',
          '900': '#5c3718',
          '950': '#341c0b',
        },
      },
      fontFamily: {
        solaimanlipi: ["SolaimanLipi", "sans-serif"],
        sans: ["Inter", "SolaimanLipi", "sans-serif"],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(16, 42, 67, 0.06), 0 4px 16px rgba(16, 42, 67, 0.06)',
        'card-lg': '0 2px 4px rgba(16, 42, 67, 0.06), 0 12px 32px rgba(16, 42, 67, 0.08)',
      }
    },
  },
  plugins: [],
}

