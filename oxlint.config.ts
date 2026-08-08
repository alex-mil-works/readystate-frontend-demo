import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['react', 'typescript', 'oxc', 'import', 'unicorn'],

  categories: {
    correctness: 'error',
    suspicious: 'warn',
    pedantic: 'off',
    style: 'off',
    restriction: 'off',
  },

  env: {
    browser: true,
  },

  settings: {
    react: {
      version: '19.2.8',
    },
  },

  ignorePatterns: ['dist/**', 'node_modules/**', 'archive/**', 'coverage/**', 'content-demo/**'],

  rules: {
    // React 17+ JSX transform — no React import required
    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'react/only-export-components': ['warn', { allowConstantExport: true }],

    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-underscore-dangle': [
      'warn',
      {
        allow: ['__dirname', '__filename'],
      },
    ],

    'import/no-cycle': 'error',
    // CSS and similar side-effect imports are expected at app bootstrap
    'import/no-unassigned-import': [
      'error',
      {
        allow: ['**/*.css'],
      },
    ],

    'typescript/no-explicit-any': 'warn',
    'typescript/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
  },

  overrides: [
    {
      files: ['**/*.{test,spec}.{ts,tsx}'],
      rules: {
        'typescript/no-explicit-any': 'off',
      },
    },
    {
      files: ['vite.config.ts', 'oxlint.config.ts', 'prettier.config.js'],
      env: {
        node: true,
      },
    },
  ],
});
