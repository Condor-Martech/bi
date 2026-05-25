/** @type {import("@ladle/react").UserConfig} */
export default {
  stories: "**/*.stories.{ts,tsx,mdx}",
  appendToHead: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
        --font-plex-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
      }
    </style>
  `,
};
