import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { sand: "#F6F1E7", ink: "#10231B", lagoon: "#0F766E", apricot: "#F4A261", mist: "#E4EFEA", berry: "#8F2D56" },
      fontFamily: { sans: ["var(--font-body)"], heading: ["var(--font-heading)"] },
      boxShadow: { soft: "0 24px 80px rgba(16, 35, 27, 0.12)" },
      backgroundImage: { "hero-grid": "linear-gradient(to right, rgba(16, 35, 27, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 35, 27, 0.06) 1px, transparent 1px)" }
    }
  },
  plugins: []
};
export default config;
