/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_API_URL?: string;
  readonly VITE_SITE_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
