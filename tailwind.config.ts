import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink:'#172B4D', muted:'#667085', brand:'#3156D8', mint:'#DDF7EA', paper:'#F7F8FC' }, boxShadow: { soft:'0 12px 36px rgba(20,35,80,.07)' } } }, plugins: [] };
export default config;
