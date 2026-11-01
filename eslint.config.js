//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    // Plain-JS config files sit outside the TypeScript project the lint
    // rules need, .kilo holds editor worktrees (copies of src), and
    // .netlify holds the Netlify CLI's generated build and dev files.
    ignores: [
      'dist/**',
      '.kilo/**',
      '.netlify/**',
      'eslint.config.js',
      'prettier.config.js',
      'src/postcss.config.js',
    ],
  },
  ...tanstackConfig,
]
