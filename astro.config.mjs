// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  base: "/", // Set this to '/' if you want to serve from the root
  output: "server",
  adapter: netlify(),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});