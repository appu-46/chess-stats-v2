import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  MantineProvider,
  createTheme,
  type MantineColorsTuple,
} from '@mantine/core'

import './styles.css'
import App from './App.tsx'
import PageNotFound from './ui/PageNotFound.tsx'
import Stats from './pages/Stats.tsx'
import Profile from './pages/Profile.tsx'
import Header from './components/Header.tsx'
import { TabProvider } from './contexts/TabContext.tsx'
import Footer from './components/Footer.tsx'
import DashBoard from './pages/DashBoard.tsx'
import Games from './pages/Games.tsx'
import SideBar from './components/SideBar.tsx'
import { StyledAppLayout } from './ui/AppLayout.tsx'
import { GlobalStyle } from './styles/GlobalStyle.ts'
import { processAndClearAccessToken } from './helpers/urlUtility.ts'
import Favorites from './pages/Favorites.tsx'
import MobileNotice from './ui/MobileNotice.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
})

processAndClearAccessToken()

// const rootRoute = createRootRoute({
//   component: () => {
//     const { pathname } = useLocation()
//     return (
//       <>
//         <StyledAppLayout>
//           {pathname !== '/' && <Header />}

//           <SideBar />
//           <main style={{ paddingLeft: '1rem' }}>
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
          {pathname !== '/' && <Header />}
          <SideBar />
          <main style={{ paddingLeft: '1rem' }}>
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
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$username',
  component: Profile,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/$username',
  component: DashBoard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      range: (search.range as string) || '30D',
      year: search.year as string | undefined,
      month: search.month as string | undefined,
    }
  },
})

const gamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/games/$username',
  component: Games,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      year: search.year as string | undefined,
      month: search.month as string | undefined,
    }
  },
})

const favouritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favourites/$sub',
  component: Favorites,
  beforeLoad: () => {
    const token = sessionStorage.getItem('access_token')
    if (!token) throw redirect({ to: '/', search: { changeUsername: false } })
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
