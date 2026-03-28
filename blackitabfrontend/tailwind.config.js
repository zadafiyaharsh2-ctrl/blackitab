/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {"on-secondary-container":"#ddcdff","secondary-container":"#7000ff","on-tertiary":"#490080","on-secondary":"#3c0090","secondary":"#d1bcff","on-primary-container":"#f1f2ff","outline-variant":"#424656","surface-variant":"#2d3449","on-error":"#690005","surface-container-highest":"#2d3449","inverse-surface":"#dae2fd","secondary-fixed":"#e9ddff","on-primary-fixed-variant":"#003ea8","on-tertiary-fixed":"#2c0051","on-primary":"#002a78","surface":"#0b1326","on-secondary-fixed-variant":"#5700c9","surface-container-lowest":"#060e20","on-primary-fixed":"#00174b","error":"#ffb4ab","tertiary-fixed":"#f0dbff","surface-dim":"#0b1326","primary-fixed-dim":"#b4c5ff","primary-container":"#0061ff","on-tertiary-fixed-variant":"#6900b3","tertiary-container":"#9541e4","outline":"#8c90a2","surface-container":"#171f33","surface-container-high":"#222a3d","tertiary":"#ddb7ff","primary":"#b4c5ff","inverse-on-surface":"#283044","tertiary-fixed-dim":"#ddb7ff","inverse-primary":"#0052dc","surface-tint":"#b4c5ff","on-background":"#dae2fd","on-surface":"#dae2fd","secondary-fixed-dim":"#d1bcff","on-surface-variant":"#c2c6d9","on-error-container":"#ffdad6","background":"#0b1326","on-secondary-fixed":"#23005b","surface-container-low":"#131b2e","error-container":"#93000a","primary-fixed":"#dbe1ff","surface-bright":"#31394d","on-tertiary-container":"#fbefff"},
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
