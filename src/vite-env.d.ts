/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO?: string;
  readonly VITE_CONTENT_SOURCE?: string;
  readonly VITE_SITE_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
