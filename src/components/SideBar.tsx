import { useState } from 'react'
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import { CgProfile } from 'react-icons/cg'
import { MdFavorite, MdGames } from 'react-icons/md'
import { FaChartArea, FaEdit } from 'react-icons/fa'

import { TiHome } from 'react-icons/ti'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoStatsChart } from 'react-icons/io5'
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core'
import classes from '../css/NavbarMinimal.module.css'
import DarkModeToggle from '../ui/DarkModeToggle'
import useGoogleUser from '../hooks/useGoogleUser'
import useGetUser from '../hooks/useGetUser'

interface NavbarLinkProps {
  icon: typeof TiHome
  label: string
  active?: boolean
  onClick?: () => void
  collapsed?: boolean
  disabled?: boolean
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed,
  disabled,
}: NavbarLinkProps) {
  return (
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ duration: 0 }}
      disabled={!collapsed}
    >
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
        data-disabled={disabled || undefined}
      >
        <Icon size={20} stroke="1.5" />
        {!collapsed && <span style={{ marginLeft: '12px' }}>{label}</span>}
      </UnstyledButton>
    </Tooltip>
  )
}

const mockdata = [
  { icon: TiHome, label: 'Home' },
  { icon: CgProfile, label: 'Profile' },
  { icon: IoStatsChart, label: 'Stats' },
  { icon: FaChartArea, label: 'Dashboard' },
  { icon: MdGames, label: 'Games' },
  { icon: MdFavorite, label: 'Favourites' },
]

const pages = ['/', 'profile', 'stats', 'dashboard', 'games', 'favourites']

function SideBar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const currentParentPath = routerState.location.pathname
    .split('/')
    .filter(Boolean)[0]
  const [active, setActive] = useState(pages.indexOf(currentParentPath))
  const [collapsed, setCollapsed] = useState(true)
  const isOnHomePage = currentPath === '/'
  const params = isOnHomePage ? null : useParams({ strict: false })
  // const {data : }
  const navigate = useNavigate()
  const { data: googleUser } = useGoogleUser()
  const { data: dbUser } = useGetUser(googleUser?.sub)
  const username = params?.username || dbUser?.chessUserId

  const { sub } = googleUser ?? {}

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    document.documentElement.style.setProperty(
      '--sidebar-width',
      next ? '80px' : '20vh',
    )
  }

  function handleClick(index: number) {
    if (isOnHomePage || !username) return
    setActive(index)
    toggleCollapsed

    const routes = [
      { to: '/' as const },
      { to: '/profile/$username' as const, params: { username } },
      { to: '/stats/$username' as const, params: { username } },
      { to: '/dashboard/$username' as const, params: { username } },
      { to: '/games/$username' as const, params: { username } },
      { to: '/favourites/$sub' as const, params: { sub } },
    ]

    const route = routes[index]
    if (index === 0) {
      navigate({ to: route.to })
    } else {
      navigate(route as any)
    }
  }

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      disabled={isOnHomePage}
      onClick={() => handleClick(index)}
      collapsed={collapsed}
    />
  ))

  return (
    <>
      <nav
        className={`${classes.navbar} ${collapsed ? classes.collapsed : classes.expanded}`}
      >
        <Center>
          <UnstyledButton
            onClick={() => toggleCollapsed()}
            className={classes.hamburger}
          >
            <GiHamburgerMenu />
          </UnstyledButton>
        </Center>
        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
          <DarkModeToggle />
        </div>
        {googleUser && (
          <div
            style={{
              borderTop:
                '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
              paddingTop: 'var(--mantine-spacing-sm)',
              width: '100%',
            }}
          >
            {!collapsed && (
              <>
                <div
                  style={{
                    padding: 'var(--mantine-spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: 0,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--mantine-color-blue-filled)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {googleUser.given_name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {googleUser.given_name}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>
                      ♟ {dbUser?.chessUserId ?? '—'}
                    </div>
                  </div>
                </div>
              </>
            )}
            <NavbarLink
              icon={FaEdit}
              label="Edit username"
              onClick={() =>
                navigate({ to: '/', search: { changeUsername: true } })
              }
              collapsed={collapsed}
            />
          </div>
        )}
      </nav>
    </>
  )
}

export default SideBar
