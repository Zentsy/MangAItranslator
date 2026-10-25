/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        display: ['"Anton"', '"Archivo"', "sans-serif"],
        body: ['"Archivo"', "sans-serif"],
        pixel: ['"DotGothic16"', "monospace"],
        brush: ['"Yuji Syuku"', "serif"],
      },
      boxShadow: {
        ink: "3px 3px 0px #0B0C10",
        "ink-lg": "4px 4px 0px #0B0C10",
        hanko: "3px 3px 0px #E8382B",
        "hanko-lg": "4px 4px 0px #E8382B",
        washi: "3px 3px 0px #E9E2CF",
        gold: "3px 3px 0px #D97706",
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        nanquim: {
          DEFAULT: "#0B0C10",
          pure: "#000000",
          deep: "#0B0C10",
          surface: "#14161D",
          elevated: "#1C1F2B",
          border: "#2A2E3D",
        },
        washi: {
          DEFAULT: "#F3EFE3",
          raw: "#F3EFE3",
          parch: "#E9E2CF",
          aged: "#DFD7C0",
          border: "#D4CBBA",
        },
        hanko: {
          DEFAULT: "#E8382B",
          dark: "#B5271D",
          bright: "#FF453A",
        },
        verm: {
          DEFAULT: "#E8382B",
          dark: "#B5271D",
          bright: "#FF453A",
        },
        gold: {
          DEFAULT: "#D97706",
          bright: "#F59E0B",
          aged: "#B45309",
        },
        app: {
          bg: "rgb(var(--app-bg) / <alpha-value>)",
          surface: "rgb(var(--app-surface) / <alpha-value>)",
          card: "rgb(var(--app-surface) / <alpha-value>)",
          accent: "rgb(var(--app-accent) / <alpha-value>)",
          "text-primary": "rgb(var(--app-text-primary) / <alpha-value>)",
          "text-secondary": "rgb(var(--app-text-secondary) / <alpha-value>)",
          border: "rgb(var(--app-border) / <alpha-value>)",
        },
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}