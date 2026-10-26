import { configDefaults, defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  server: {
    // The same proxy as netlify.toml's, for chess.com's ranks 51-100.
    proxy: {
      '/api/chesscom-leaderboard': {
        target: 'https://www.chess.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/chesscom-leaderboard/, '/callback/leaderboard'),
      },
    },
  },
  test: {
    // .kilo holds editor worktrees: copies of src whose tests would
    // otherwise run a second time.
    exclude: [...configDefaults.exclude, '.kilo/**'],
  },
})
