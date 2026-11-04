/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        lg: "2rem",
        "2xl": "3rem",
      },
      screens: {
        "2xl": "1560px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "Plus Jakarta Sans", "sans-serif"],
      },
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
        tremor: {
          brand: {
            faint: "#fff1f2",
            muted: "#ffe4e6",
            subtle: "#fecdd3",
            DEFAULT: "#e11d48",
            emphasis: "#be123c",
            strong: "#9f1239",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f8f4ee",
            subtle: "#f3ede5",
            DEFAULT: "#ffffff",
            emphasis: "#ece5db",
          },
          border: {
            DEFAULT: "#e9e2d8",
          },
          text: {
            default: "#17171c",
            muted: "#6f6a63",
            subtle: "#9c958b",
            strong: "#000000",
            inverted: "#ffffff",
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#1c0a10",
            muted: "#3f1020",
            subtle: "#6b1730",
            DEFAULT: "#f43f5e",
            emphasis: "#fb7185",
            strong: "#fda4af",
            inverted: "#ffffff",
          },
          background: {
            muted: "#121110",
            subtle: "#181614",
            DEFAULT: "#0d0c0b",
            emphasis: "#2a2622",
          },
          border: {
            DEFAULT: "#2a2622",
          },
          text: {
            default: "#fafafa",
            muted: "#a1a1aa",
            subtle: "#71717a",
            strong: "#ffffff",
            inverted: "#000000",
          },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        pin: "0 18px 40px -24px rgba(15, 15, 20, 0.35)",
        float: "0 30px 70px -30px rgba(15, 15, 20, 0.45)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.15), 0 18px 60px -20px hsl(var(--primary) / 0.35)",
        clay:
          "0 1px 0 0 rgba(255,255,255,0.78) inset, 0 -4px 10px 0 rgba(15,15,20,0.10) inset, 0 9px 18px -10px rgba(15,15,20,0.42)",
        "clay-dark":
          "0 1px 0 0 rgba(255,255,255,0.12) inset, 0 -4px 10px 0 rgba(0,0,0,0.45) inset, 0 10px 22px -12px rgba(0,0,0,0.8)",
        "clay-pressed":
          "0 1px 3px 0 rgba(15,15,20,0.18) inset, 0 2px 6px -4px rgba(15,15,20,0.35)",
        "clay-pressed-dark":
          "0 1px 3px 0 rgba(0,0,0,0.55) inset, 0 2px 6px -4px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg|text|border|ring|fill|stroke)-(tremor|dark-tremor)-(brand|background|border|text)/,
      variants: ["hover", "ui-selected", "dark"],
    },
    {
      pattern:
        /^(bg|text|fill|stroke)-(rose|zinc|amber|sky|violet|emerald)-(400|500)$/,
      variants: ["dark"],
    },
  ],
  plugins: [animate],
}
