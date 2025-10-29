import { useState } from 'react'
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import { CgProfile } from 'react-icons/cg'
import { MdGames } from 'react-icons/md'
import { FaChartArea } from 'react-icons/fa'
import { TiHome } from 'react-icons/ti'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoStatsChart } from 'react-icons/io5'
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core'
import classes from '../css/NavbarMinimal.module.css'
import DarkModeToggle from '../ui/DarkModeToggle'

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
]

const pages = ['/', 'profile', 'stats', 'dashboard', 'games']

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
  const username = params?.username || ''
  const navigate = useNavigate()

  function handleClick(index: number) {
    if (isOnHomePage || !username) return
    setActive(index)
    setCollapsed(true)

    const routes = [
      { to: '/' as const },
      { to: '/profile/$username' as const, params: { username } },
      { to: '/stats/$username' as const, params: { username } },
      { to: '/dashboard/$username' as const, params: { username } },
      { to: '/games/$username' as const, params: { username } },
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
            onClick={() => setCollapsed(!collapsed)}
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
      </nav>
    </>
  )
}

export default SideBar
