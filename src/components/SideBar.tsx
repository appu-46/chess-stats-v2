import { useState } from 'react'
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import { CgProfile } from 'react-icons/cg'
import { MdGames } from 'react-icons/md'
import { FaChartArea } from 'react-icons/fa'
import { TiHome } from 'react-icons/ti'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoStatsChart } from 'react-icons/io5'
import {
  Center,
  Stack,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core'
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '../css/NavbarMinimal.module.css'

// import { Logo } from './Header'

interface NavbarLinkProps {
  icon: typeof TiHome
  label: string
  active?: boolean
  onClick?: () => void
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={20} stroke="1.5" />
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
  const isOnHomePage = currentPath === '/'
  const { username } = isOnHomePage
    ? ''
    : useParams({ from: `/${currentParentPath}/$username` })
  // const { colorScheme } = useMantineColorScheme()
  const navigate = useNavigate()

  function handleClick(index: number) {
    if (isOnHomePage) return

    if (index === 0) navigate({ to: '/' })
    else if (index === 1)
      (navigate({ to: '/profile/$username', params: { username } }),
        setActive(index))
    else if (index === 2)
      (navigate({ to: '/stats/$username', params: { username } }),
        setActive(index))
    else if (index === 3)
      (navigate({ to: '/dashboard/$username', params: { username } }),
        setActive(index))
    else if (index === 4)
      (navigate({ to: '/games/$username', params: { username } }),
        setActive(index))
    else setActive(0)
  }

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => handleClick(index)}
    />
  ))

  return (
    <nav className={classes.navbar}>
      <Center>
        <GiHamburgerMenu />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>
    </nav>
  )
}

export default SideBar
