/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050507",
          card: "rgba(12, 14, 24, 0.7)",
          cardHover: "rgba(20, 24, 40, 0.85)",
          border: "rgba(255, 255, 255, 0.08)",
          borderActive: "rgba(0, 240, 255, 0.4)",
          cyan: "#00f0ff",
          purple: "#9d4edd",
          magenta: "#ff007f",
          neonGreen: "#00ff88",
          amber: "#ffb703",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      boxShadow: {
        "neon-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.5)",
        "neon-magenta": "0 0 25px -5px rgba(255, 0, 127, 0.5)",
        "neon-purple": "0 0 25px -5px rgba(157, 78, 221, 0.5)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.4))" },
          "100%": { filter: "drop-shadow(0 0 25px rgba(255, 0, 127, 0.7))" },
        },
      },
    },
  },
  plugins: [],
};
