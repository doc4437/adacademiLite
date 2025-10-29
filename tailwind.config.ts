import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "rice-paper": "#F6F3EF",
        "river-stone": "#2F2F2B",
        clay: "#E9E5DF",
        graphite: "#D1CDC7",
        ink: "#3C3A37",
        weathered: "#6C6963",
        ash: "#B8B4AF",
        moss: "#9BA88E",
        umber: "#A58B6F",
        gold: "#C7B77E",
        "indigo-gray": "#6A6E7A",
        "earth-red": "#B5654A",
        "stone-dark": "#3A3935",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["'DM Serif Display'", ...fontFamily.serif],
      },
      backgroundImage: {
        "morning-mist": "linear-gradient(180deg, #F6F3EF 0%, #E9E5DF 100%)",
        "evening-stone": "linear-gradient(180deg, #3A3935 0%, #2F2F2B 100%)",
      },
      boxShadow: {
        "zen-sm": "0 1px 2px 0 rgba(60, 58, 55, 0.05)",
        zen: "0 2px 4px 0 rgba(60, 58, 55, 0.08)",
        "zen-md": "0 4px 8px 0 rgba(60, 58, 55, 0.12)",
        "zen-lg": "0 8px 16px 0 rgba(60, 58, 55, 0.15)",
        "zen-inner": "inset 0 2px 4px 0 rgba(60, 58, 55, 0.06)",
      },
      transitionDuration: {
        breath: "250ms",
      },
      transitionTimingFunction: {
        breath: "cubic-bezier(0.4, 0, 0.2, 1)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
