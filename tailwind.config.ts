import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    dark: "#1B5E20",
                    DEFAULT: "#2E7D32",
                    light: "#4CAF50",
                    pale: "#E8F5E9",
                },
                accent: {
                    DEFAULT: "#F9A825",
                    deep: "#E65100",
                },
                gray: {
                    800: "#17171A",
                    500: "#5F6368",
                },
            },
            boxShadow: {
                custom: "0 10px 30px -10px rgba(46,125,50,0.15)",
            },
        },
    },
    plugins: [],
};
export default config;
