//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    // Plain-JS config files sit outside the TypeScript project the lint
    // rules need, and .kilo holds editor worktrees (copies of src).
    ignores: [
      'dist/**',
      '.kilo/**',
      'eslint.config.js',
      'prettier.config.js',
      'src/postcss.config.js',
    ],
  },
  ...tanstackConfig,
]
