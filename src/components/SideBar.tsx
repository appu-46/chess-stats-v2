import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
  useRouterState,
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  TbArrowsLeftRight,
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
  TbTrophy,
} from 'react-icons/tb'
import { RiLoginBoxFill, RiLogoutBoxRFill } from 'react-icons/ri'
// The original sidebar icons.
import { TiHome } from 'react-icons/ti'
import { CgProfile } from 'react-icons/cg'
import { IoStatsChart } from 'react-icons/io5'
import { FaChartArea, FaEdit, FaUserCircle } from 'react-icons/fa'
import { MdFavorite, MdGames } from 'react-icons/md'
import { Tooltip, UnstyledButton } from '@mantine/core'
import classes from '../css/NavbarMinimal.module.css'
import useGoogleUser from '../hooks/useGoogleUser'
import useGetUser from '../hooks/useGetUser'
import usePlatform from '../hooks/usePlatform'
import { signOut as endSession, signInWithGoogle } from '../services/OAuth'
import {
  PLATFORM_LABELS,
  parsePlatform,
  platformSearch,
} from '../helpers/platform'
import DarkModeToggle from '../ui/DarkModeToggle'
import { useLogoSrc } from './Header'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

const COLLAPSED_KEY = 'sidebar-collapsed'
const ICON_SIZE = 20

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) !== 'false'
  } catch {
    return true
  }
}

// One row of the sidebar. Rendered as a real link when it has somewhere to
// go (so cmd/middle-click open a new tab and the current page is announced),
// or as a dimmed, explained placeholder when it doesn't yet.
function NavItem({
  icon: Icon,
  label,
  collapsed,
  active,
  disabledReason,
  link,
  onClick,
  desktopOnly,
}: {
  icon: IconType
  label: string
  collapsed: boolean
  active?: boolean
  // Set when the item can't be used right now; shown as its tooltip.
  disabledReason?: string
  link?: (content: ReactNode) => ReactNode
  onClick?: () => void
  // Left out of the phone tab bar, which only has room for the main pages.
  desktopOnly?: boolean
}) {
  const content = (
    <>
      <Icon size={ICON_SIZE} className={classes.icon} />
      <span className={classes.label}>{label}</span>
    </>
  )

  let item: ReactNode
  if (disabledReason) {
    item = (
      <span className={classes.link} data-disabled aria-disabled="true">
        {content}
      </span>
    )
  } else if (link) {
    item = link(content)
  } else {
    item = (
      <UnstyledButton className={classes.link} onClick={onClick}>
        {content}
      </UnstyledButton>
    )
  }

  return (
    <Tooltip
      label={disabledReason ?? label}
      position="right"
      openDelay={150}
      // Labels are visible when expanded; only explain disabled items then.
      disabled={!collapsed && !disabledReason}
      events={{ hover: true, focus: true, touch: false }}
    >
      <div
        className={classes.item}
        data-active={active || undefined}
        data-desktop-only={desktopOnly || undefined}
      >
        {item}
      </div>
    </Tooltip>
  )
}

function SideBar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  // The section is read from the URL on every render, so the highlight
  // follows any navigation (links between pages, back/forward), not just
  // clicks on the sidebar.
  const section = pathname.split('/').filter(Boolean)[0] ?? ''

  // Called unconditionally: strict:false works on every route, including
  // the home page, where it simply has no username.
  const params = useParams({ strict: false })
  const routePlatform = usePlatform()

  const { data: googleUser } = useGoogleUser()
  const { data: dbUser } = useGetUser(googleUser?.sub)
  const sub: string | undefined = googleUser?.sub

  const viewedUsername = params.username
  const ownUsername: string | undefined = dbUser?.chessUserId ?? undefined
  const ownPlatform = parsePlatform(dbUser?.chessPlatform)

  // Player pages go to whoever is being viewed; with no player in the URL
  // (home, favourites) they fall back to the signed-in user's own account.
  const username = viewedUsername ?? ownUsername
  const platform = viewedUsername ? routePlatform : ownPlatform
  const search = platformSearch(platform)

  const isViewingOther =
    !!viewedUsername &&
    !!ownUsername &&
    (viewedUsername.toLowerCase() !== ownUsername.toLowerCase() ||
      routePlatform !== ownPlatform)

  const [collapsed, setCollapsed] = useState(readCollapsed)
  const logoSrc = useLogoSrc()

  useEffect(() => {
    document.body.classList.toggle('sidebar-expanded', !collapsed)
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed))
    } catch {
      // Private mode etc.: the choice just isn't remembered.
    }
  }, [collapsed])

  async function signOut() {
    await endSession()
    queryClient.removeQueries({ queryKey: ['googleUser'] })
    queryClient.removeQueries({ queryKey: ['user'] })
    queryClient.removeQueries({ queryKey: ['favs'] })
    navigate({ to: '/', search: { changeUsername: false } })
  }

  const noPlayer = 'Search for a player first'
  const playerPages = [
    {
      section: 'profile',
      label: 'Profile',
      icon: CgProfile,
      to: '/profile/$username',
    },
    {
      section: 'stats',
      label: 'Stats',
      icon: IoStatsChart,
      to: '/stats/$username',
    },
    {
      section: 'dashboard',
      label: 'Dashboard',
      icon: FaChartArea,
      to: '/dashboard/$username',
    },
    {
      section: 'games',
      label: 'Games',
      icon: MdGames,
      to: '/games/$username',
    },
  ] as const

  const avatar: string | undefined = googleUser?.picture
  const displayName: string = googleUser?.given_name ?? ''

  return (
    <nav
      className={classes.navbar}
      data-collapsed={collapsed || undefined}
      aria-label="Main"
    >
      <div className={classes.top}>
        <Tooltip
          label="Home"
          position="right"
          openDelay={150}
          disabled={!collapsed}
          events={{ hover: true, focus: true, touch: false }}
        >
          <Link
            to="/"
            search={{ changeUsername: false }}
            className={classes.brand}
            aria-label="Chess Stats home"
          >
            <img className={classes.brandLogo} src={logoSrc} alt="" />
            <span className={classes.brandName}>Chess Stats</span>
          </Link>
        </Tooltip>
      </div>

      <div className={classes.links}>
        <NavItem
          icon={TiHome}
          label="Home"
          collapsed={collapsed}
          active={section === ''}
          link={(content) => (
            <Link
              to="/"
              search={{ changeUsername: false }}
              className={classes.link}
            >
              {content}
            </Link>
          )}
        />

        {username && !collapsed && (
          <div
            className={classes.context}
            title={`${username} · ${PLATFORM_LABELS[platform]}`}
          >
            <span className={classes.contextLabel}>
              {isViewingOther || !ownUsername ? 'Viewing' : 'Your account'}
            </span>
            <span className={classes.contextName}>{username}</span>
          </div>
        )}

        {playerPages.map((page) => (
          <NavItem
            key={page.section}
            icon={page.icon}
            label={page.label}
            collapsed={collapsed}
            active={section === page.section}
            disabledReason={username ? undefined : noPlayer}
            link={(content) => (
              <Link
                to={page.to}
                params={{ username: username! }}
                search={search}
                className={classes.link}
              >
                {content}
              </Link>
            )}
          />
        ))}

        {/* Starts with whoever is being viewed in the first slot. Phones
            reach it from the profile's Compare button instead: the tab
            bar has no room for it. */}
        <NavItem
          icon={TbArrowsLeftRight}
          label="Compare"
          collapsed={collapsed}
          active={section === 'compare'}
          desktopOnly
          link={(content) => (
            <Link
              to="/compare"
              search={
                viewedUsername
                  ? {
                      a: viewedUsername,
                      ap: routePlatform === 'lichess' ? 'lichess' : undefined,
                    }
                  : {}
              }
              className={classes.link}
            >
              {content}
            </Link>
          )}
        />

        {/* Phones reach it from the home page instead: the tab bar has no
            room for it. */}
        <NavItem
          icon={TbTrophy}
          label="Leaderboard"
          collapsed={collapsed}
          active={section === 'leaderboard'}
          desktopOnly
          link={(content) => (
            <Link to="/leaderboard" search={{}} className={classes.link}>
              {content}
            </Link>
          )}
        />

        {isViewingOther && (
          <NavItem
            icon={FaUserCircle}
            label="My profile"
            collapsed={collapsed}
            desktopOnly
            link={(content) => (
              <Link
                to="/profile/$username"
                params={{ username: ownUsername }}
                search={platformSearch(ownPlatform)}
                className={classes.link}
              >
                {content}
              </Link>
            )}
          />
        )}

        <NavItem
          icon={MdFavorite}
          label="Favourites"
          collapsed={collapsed}
          active={section === 'favourites'}
          disabledReason={sub ? undefined : 'Sign in to track players'}
          link={(content) => (
            <Link
              to="/favourites/$sub"
              params={{ sub: sub! }}
              className={classes.link}
            >
              {content}
            </Link>
          )}
        />
      </div>

      <div className={classes.bottom}>
        {/* Side by side when expanded, stacked when collapsed. Each sits in
            a slot centred on the nav icons' column. */}
        <div className={classes.controls}>
          <div className={classes.controlSlot}>
            <DarkModeToggle size="sm" />
          </div>
          <UnstyledButton
            className={classes.collapseButton}
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <TbLayoutSidebarLeftExpandFilled size={ICON_SIZE} />
            ) : (
              <TbLayoutSidebarLeftCollapseFilled size={ICON_SIZE} />
            )}
          </UnstyledButton>
        </div>

        {googleUser ? (
          <div className={classes.account}>
            <div className={classes.accountCard}>
              {avatar ? (
                <img
                  className={classes.avatar}
                  src={avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={classes.avatar}>{displayName[0]}</span>
              )}
              <div className={classes.accountText}>
                <span className={classes.accountName}>{displayName}</span>
                <span className={classes.accountHandle}>
                  {ownUsername
                    ? `${ownUsername} · ${PLATFORM_LABELS[ownPlatform]}`
                    : 'No username saved'}
                </span>
              </div>
            </div>
            <NavItem
              icon={FaEdit}
              label="Edit username"
              collapsed={collapsed}
              link={(content) => (
                <Link
                  to="/"
                  search={{ changeUsername: true }}
                  className={classes.link}
                >
                  {content}
                </Link>
              )}
            />
            <NavItem
              icon={RiLogoutBoxRFill}
              label="Sign out"
              collapsed={collapsed}
              onClick={signOut}
            />
          </div>
        ) : (
          <div className={classes.account}>
            <NavItem
              icon={RiLoginBoxFill}
              label="Sign in"
              collapsed={collapsed}
              onClick={signInWithGoogle}
            />
          </div>
        )}
      </div>
    </nav>
  )
}

export default SideBar
