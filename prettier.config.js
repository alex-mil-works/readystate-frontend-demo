/** @type {import('prettier').Config} */
export default {
  // Sort imports first, then order Tailwind classes
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],

  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  // Import groups: react → router → npm → FSD (@/…) → relative
  importOrder: [
    '^react',
    '^react-router',
    '<THIRD_PARTY_MODULES>',
    '^@/shared/(.*)$',
    '^@/entities/(.*)$',
    '^@/features/(.*)$',
    '^@/widgets/(.*)$',
    '^@/pages/(.*)$',
    '^@/app/(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx'],
};
