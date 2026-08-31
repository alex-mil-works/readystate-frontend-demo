import { defineConfig } from 'oxlint';

/** Lint rules for app + tools. Formatting stays with Prettier. */
export default defineConfig({
  plugins: ['react', 'typescript', 'oxc', 'import', 'unicorn'],

  categories: {
    correctness: 'error',
    suspicious: 'warn',
    pedantic: 'off',
    style: 'off', // Prettier owns formatting
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

  ignorePatterns: ['dist/**', 'node_modules/**', '.local/**', 'coverage/**', 'content-demo/**'],

  rules: {
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
    'import/no-unassigned-import': [
      'error',
      {
        allow: ['**/*.css'],
      },
    ],

    'typescript/no-explicit-any': 'warn',
    // Prefer `import type` when a symbol is only used in types
    'typescript/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
  },

  overrides: [
    {
      files: ['__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
      rules: {
        'typescript/no-explicit-any': 'off',
      },
    },
    {
      // kit/primary export both the component and cva variants
      files: ['src/shared/ui/primary/**/*.{ts,tsx}', 'src/shared/ui/kit/**/*.{ts,tsx}'],
      rules: {
        'react/only-export-components': 'off',
      },
    },
    {
      files: ['__tests__/setup.ts'],
      rules: {
        'import/no-unassigned-import': 'off',
      },
    },
    {
      files: [
        'vite.config.ts',
        'vitest.config.ts',
        'oxlint.config.ts',
        'prettier.config.js',
        'tools/**/*.ts',
      ],
      env: {
        node: true,
      },
    },
  ],
});
