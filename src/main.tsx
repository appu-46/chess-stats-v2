import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  stringifySearchWith,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, createTheme } from '@mantine/core'

import './styles.css'
import App from './App.tsx'
import PageNotFound from './ui/PageNotFound.tsx'
import Stats from './pages/Stats.tsx'
import Profile from './pages/Profile.tsx'
import { CompactHeader } from './components/Header.tsx'
import { TabProvider } from './contexts/TabContext.tsx'
import Footer from './components/Footer.tsx'
import DashBoard from './pages/DashBoard.tsx'
import Games from './pages/Games.tsx'
import SideBar from './components/SideBar.tsx'
import { StyledAppLayout } from './ui/AppLayout.tsx'
import { GlobalStyle } from './styles/GlobalStyle.ts'
import { supabase } from './services/supabase.ts'
import Favorites from './pages/Favorites.tsx'
import MobileNotice from './ui/MobileNotice.tsx'
import { validatePlatformSearch } from './helpers/platform.ts'
import type { MantineColorsTuple } from '@mantine/core'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
})

// Re-read the signed-in user whenever the session starts or ends (including
// in another tab). Deferred, as supabase-js warns against calling back into
// the client from inside this callback.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['googleUser'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }, 0)
  }
})

// const rootRoute = createRootRoute({
//   component: () => {
//     const { pathname } = useLocation()
//     return (
//       <>
//         <StyledAppLayout>
//           {pathname !== '/' && <CompactHeader />}

//           <SideBar />
//           <main style={{ padding: '2.5rem 0 0 1rem' }}>
//             <Outlet />
//           </main>
//           <Footer />
//           <TanStackRouterDevtools />
//         </StyledAppLayout>
//       </>
//     )
//   },
//   notFoundComponent: PageNotFound,
// })

const SECTION_TITLES: Record<string, string> = {
  stats: 'Stats',
  profile: 'Profile',
  dashboard: 'Dashboard',
  games: 'Games',
  favourites: 'Favorites',
}

function usePageTitle(pathname: string) {
  useEffect(() => {
    const [, section, param] = pathname.split('/')
    const label = section ? SECTION_TITLES[section] : undefined

    if (!label) {
      document.title = 'Chess Stats'
      return
    }

    // /favourites/$sub carries a route id, not a username — skip it.
    const username =
      param && section !== 'favourites' ? decodeURIComponent(param) : ''

    document.title = username
      ? `${username} · ${label} · Chess Stats`
      : `${label} · Chess Stats`
  }, [pathname])
}

const rootRoute = createRootRoute({
  component: () => {
    const { pathname } = useLocation()
    usePageTitle(pathname)

    return (
      <>
        <MobileNotice />
        <StyledAppLayout>
          <CompactHeader showBrand={pathname !== '/'} />
          <SideBar />
          <main style={{ padding: '1.25rem 0 0 1rem' }}>
            <Outlet />
          </main>
          <Footer />
          <TanStackRouterDevtools />
        </StyledAppLayout>
      </>
    )
  },
  notFoundComponent: PageNotFound,
})

// Search value as a string, whether the URL held 2026, "2026" (older,
// quoted links) or nothing.
function searchString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return String(value)
}

// Months and days are kept zero-padded ("09"), as the APIs and day keys use.
function searchPadded(value: unknown): string | undefined {
  const text = searchString(value)
  return text?.padStart(2, '0')
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      changeUsername: search.changeUsername as boolean | undefined,
    }
  },
})

const statRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats/$username',
  component: Stats,
  validateSearch: validatePlatformSearch,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$username',
  component: Profile,
  validateSearch: validatePlatformSearch,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/$username',
  component: DashBoard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      range: searchString(search.range) || '30D',
      year: searchString(search.year),
      month: searchPadded(search.month),
      ...validatePlatformSearch(search),
    }
  },
})

const gamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/games/$username',
  component: Games,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      year: searchString(search.year),
      month: searchPadded(search.month),
      // Set when opened from a day on the dashboard chart: the page then
      // lists that day's games (and can be reloaded or shared).
      day: searchPadded(search.day),
      ...validatePlatformSearch(search),
    }
  },
})

const favouritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favourites/$sub',
  component: Favorites,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session)
      throw redirect({ to: '/', search: { changeUsername: false } })
  },
})

// const theme = useMantineTheme()

// Soft sage-mint scale (0 lightest → 9 darkest) used as the Mantine primary
// color, so focus rings, tooltips and other accents blend with the theme.
const mint: MantineColorsTuple = [
  '#e7f9f1',
  '#c6f0df',
  '#9ae6c8',
  '#6dd9b0',
  '#48cd9d',
  '#2fbd8b',
  '#2fa07d',
  '#278066',
  '#1f6a54',
  '#144d3d',
]

const theme = createTheme({
  colors: { mint },
  primaryColor: 'mint',
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  statRoute,
  profileRoute,
  dashboardRoute,
  gamesRoute,
  favouritesRoute,
])

const router = createRouter({
  routeTree,
  // Without a parser argument, plain strings are written unquoted
  // (?year=2026 rather than ?year="2026"). Reading still JSON-parses, so
  // number-like values come back as numbers; validateSearch turns the ones
  // we keep as strings back with searchString.
  stringifySearch: stringifySearchWith(JSON.stringify),
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <TabProvider>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <RouterProvider router={router} />
          </MantineProvider>
        </TabProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
