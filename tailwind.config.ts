import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Everforest Light Theme Colors (Hard Contrast)
        everforest: {
          // Backgrounds (palette1 hard)
          'bg-dim':   '#F2EFDF',
          'bg0':      '#FFFBEF',
          'bg1':      '#F8F5E4',
          'bg2':      '#F2EFDF',  // also used as bg_dim in docs
          'bg3':      '#EDEADA',
          'bg4':      '#E8E5D5',
          'bg5':      '#BEC5B2',
          'bg-visual':'#F0F2D4',
          'bg-red':   '#FFE7DE',
          'bg-yellow':'#FEF2D5',
          'bg-green': '#F3F5D9',
          'bg-blue':  '#ECF5ED',
          'bg-purple':'#FCECED',

          // Foregrounds (palette2 light)
          'fg':   '#5C6A72',
          'red':  '#F85552',        // Light hard red
          'red-pastel': '#E67E80',  // base pastel
          'red-700': '#E03E3B',     // shade
          'orange':'#F57D26',
          'orange-500':'#FF8F3D',
          'orange-700':'#E06A15',
          'yellow':'#DFA000',
          'yellow-500':'#F0B300',
          'yellow-700':'#C78F00',
          'green':'#8DA101',
          'green-500':'#9FB315',
          'green-700':'#7A8E01',
          'aqua':'#35A77C',         // Light hard aqua
          'aqua-500':'#47B889',     // tint
          'aqua-600':'#35A77C',     // base
          'aqua-700':'#2D8F69',     // shade
          'blue':'#3A94C5',
          'blue-500':'#4DA8D8',
          'blue-700':'#2D7FA8',
          'purple':'#DF69BA',
          'purple-500':'#E87FCB',
          'purple-700':'#C5579F',

          // Greys + statusline
          'grey0':'#A6B0A0',
          'grey1':'#939F91',
          'grey2':'#829181',
          'statusline1':'#93B259',
          'statusline2':'#708089',
          'statusline3':'#E66868',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
