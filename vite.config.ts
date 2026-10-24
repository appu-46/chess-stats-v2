import { configDefaults, defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  test: {
    // .kilo holds editor worktrees: copies of src whose tests would
    // otherwise run a second time.
    exclude: [...configDefaults.exclude, '.kilo/**'],
  },
})
