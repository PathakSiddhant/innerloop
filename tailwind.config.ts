import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import svgToDataUri from "mini-svg-data-uri";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-dot-matrix": (value: string) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none">
                <circle fill="${value}" cx="10" cy="10" r="1.6257413380501518" />
              </svg>`
            )}")`,
          }),
        },
        {
          values: flattenColorPalette(theme("backgroundColor")),
          type: "color",
        }
      );
    }),
  ],
};

export default config;
