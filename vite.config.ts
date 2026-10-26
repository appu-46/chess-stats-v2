import { configDefaults, defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// The deployed address. Netlify sets URL on every build (the site's main
// address); local builds and the dev server use localhost.
const SITE_URL = (process.env.URL ?? 'http://localhost:3000').replace(/\/$/, '')

// Pages worth listing for search engines. Player pages are endless, so a
// few well-known players stand in for them; search engines find the rest
// through links.
const SITEMAP_PATHS = [
  '/',
  '/leaderboard',
  '/leaderboard?tc=rapid',
  '/leaderboard?tc=bullet',
  '/leaderboard?platform=lichess',
  '/compare',
  '/profile/hikaru',
  '/profile/magnuscarlsen',
  '/profile/DrNykterstein?platform=lichess',
]

function escapeXml(text: string) {
  return text.replace(/&/g, '&amp;')
}

// Fills %SITE_URL% into index.html's link-preview tags (they must be full
// addresses), and writes robots.txt and sitemap.xml, which need it too.
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      })
      const urls = SITEMAP_PATHS.map(
        (path) => `  <url><loc>${escapeXml(SITE_URL + path)}</loc></url>`,
      ).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss(), siteMeta()],
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
