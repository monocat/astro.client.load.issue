// src/astro-shims.d.ts
/// <reference types="astro/client" />

declare namespace astroHTML.JSX {
  interface ScriptHTMLAttributes {
    // these are the built-in Astro hydration directives
    "client:load"?: boolean;
    "client:idle"?: boolean;
    "client:visible"?: boolean;
    "client:media"?: string;
    type?: string; // so `type="module"` is recognized, too
  }
  interface AstroDefineVarsAttribute {
    "define:vars"?: Record<string, any>;
  }
}