/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        fly: {
          blue:   '#0073bd',
          blue600:'#005f9e',
          blue700:'#004e83',
          blue50: '#e8f3fb',
          red:    '#ed174c',
          red600: '#d11042',
          red700: '#b00d38',
          red50:  '#fdeaf0',
          green:  '#80c342',
          green600:'#6aa835',
          green50:'#f1f8e8',
          ink:    '#10151d',
          ink2:   '#3d4757',
          ink3:   '#6b7686',
          line:   '#e7ecf3',
          soft:   '#f4f8fc',
          navy:   '#0a1730',
          navy2:  '#0f2342',
        },
      },
      fontFamily: {
        display: ['Exo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'fly':    '0 10px 30px rgba(16,40,80,.10)',
        'fly-lg': '0 24px 60px rgba(12,35,75,.16)',
        'fly-red':'0 12px 30px rgba(237,23,76,.32)',
      },
      borderRadius: { 'fly': '14px', 'fly-lg': '22px', 'fly-xl': '30px' },
    },
  },
  plugins: [],
}
