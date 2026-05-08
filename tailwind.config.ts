import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Everforest Dark Hard theme colors
        everforest: {
          // Backgrounds and tinted surfaces
          'bg-dim':   '#1E2326',
          'bg0':      '#272E33',
          'bg1':      '#2E383C',
          'bg2':      '#374145',
          'bg3':      '#414B50',
          'bg4':      '#495156',
          'bg5':      '#4F5B58',
          'bg-visual':'#253138',
          'bg-red':   '#4C3743',
          'bg-yellow':'#45443C',
          'bg-green': '#3C4841',
          'bg-blue':  '#384B55',
          'bg-purple':'#463F48',

          // Foregrounds and accents
          'fg':   '#D3C6AA',
          'red':  '#E67E80',
          'red-pastel': '#E67E80',
          'red-700': '#D06467',
          'orange':'#E69875',
          'orange-500':'#E69875',
          'orange-700':'#C97C5B',
          'yellow':'#DBBC7F',
          'yellow-500':'#DBBC7F',
          'yellow-700':'#B99E63',
          'green':'#83C092',
          'green-500':'#83C092',
          'green-700':'#6AA579',
          'aqua':'#7FBBB3',
          'aqua-500':'#7FBBB3',
          'aqua-600':'#7FBBB3',
          'aqua-700':'#669F99',
          'blue':'#7FBBB3',
          'blue-500':'#7FBBB3',
          'blue-700':'#669F99',
          'purple':'#D699B6',
          'purple-500':'#D699B6',
          'purple-700':'#B77C99',

          // Greys and status line
          'grey0':'#9DA9A0',
          'grey1':'#859289',
          'grey2':'#7A8478',
          'statusline1':'#83C092',
          'statusline2':'#7FBBB3',
          'statusline3':'#E67E80',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
