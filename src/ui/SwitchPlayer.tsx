// "Switch player": a small button beside the name on the player pages. It
// opens the site's player search in a modal, with the signed-in user's
// favourites and the famous players under it, and goes to the same page
// for whoever is picked, so Games stays Games. Pressing "/" opens it too,
// except while typing in a field (useHotkeys ignores inputs).
import { useEffect, useId, useRef, useState } from 'react'
import styled from 'styled-components'
import { Modal, Tooltip } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { useMatches, useNavigate, useParams } from '@tanstack/react-router'
import { TbUserSearch } from 'react-icons/tb'
import { platformSearch } from '../helpers/platform'
import { brandModalStyles } from './modalStyles'
import PlayerSearchBar from './PlayerSearchBar'
import PlayerPicks, { usePlayerPicks } from './PlayerPicks'
import type { FormEventHandler, KeyboardEvent } from 'react'
import type { Platform } from '../helpers/platform'

const PLAYER_PAGES = [
  '/profile/$username',
  '/stats/$username',
  '/dashboard/$username',
  '/games/$username',
] as const

type PlayerPage = (typeof PLAYER_PAGES)[number]

function isPlayerPage(path: string | undefined): path is PlayerPage {
  return PLAYER_PAGES.includes(path as PlayerPage)
}

const INPUT_NAME = 'switch-player'

// A small mint chip in the brand colours, like the list headers and the
// platform switch's outline, so it reads as part of the app rather than a
// grey add-on. On hover it fills with the same green as a selected
// toggle. Phones show the icon only, beside a name that may already fill
// the line.
const Trigger = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 1.6rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  cursor: pointer;
  /* Light mode needs a deeper green than --brand to read on a pale page;
     the mint outline alone washed out there. */
  color: light-dark(#1f7a5a, var(--brand-soft));
  background: light-dark(rgba(52, 163, 126, 0.12), rgba(110, 231, 183, 0.06));
  border: 1px solid light-dark(var(--brand-border), var(--brand-border-soft));
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    background: var(--brand-fill);
    border-color: transparent;
    color: var(--on-brand);
    box-shadow: 0 2px 10px var(--brand-glow);
  }

  @media (max-width: 768px) {
    width: 1.6rem;
    padding: 0;
    justify-content: center;

    & > span {
      display: none;
    }
  }
`

// Whether the username input's suggestion dropdown is open with options
// in it. Mantine points the input at the list (aria-controls) only while
// it's open.
function suggestionsShown(target: EventTarget) {
  const listId = (target as HTMLElement).getAttribute('aria-controls')
  return (
    !!listId &&
    !!document.getElementById(listId)?.querySelector('[role="option"]')
  )
}

// What's inside the modal. Mounted only while it's open, so the
// favourites and famous players are fetched then and the search starts
// empty each time.
function SwitchPlayerBody({
  platform,
  settled,
  onPick,
}: {
  platform: Platform
  settled: boolean
  onPick: (username: string, platform: Platform) => void
}) {
  const params = useParams({ strict: false })
  const currentUsername = 'username' in params ? params.username : undefined
  const [value, setValue] = useState('')
  const [searchPlatform, setSearchPlatform] = useState(platform)
  const [active, setActive] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const sections = usePlayerPicks(
    value,
    currentUsername ? { username: currentUsername, platform } : null,
  )
  const picks = sections.flatMap((section) => section.players)
  const activeIndex = active < picks.length ? active : -1

  // Mantine focuses the first control, the platform switch; the username
  // is what people came to type.
  useEffect(() => {
    if (!settled) return
    bodyRef.current
      ?.querySelector<HTMLInputElement>(`input[name="${INPUT_NAME}"]`)
      ?.focus()
  }, [settled])

  function onChange(next: string) {
    setValue(next)
    setActive(-1)
  }

  // Up and down move through the favourites and famous players, and Enter
  // opens the highlighted one; with none highlighted, Enter searches as
  // usual. The keys are left alone while the username suggestions are
  // open, which use them too.
  function onKeyDownCapture(event: KeyboardEvent<HTMLDivElement>) {
    if (!picks.length || suggestionsShown(event.target)) return

    // Stopped too, or the closed suggestions dropdown would open on them.
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      setActive(Math.min(activeIndex + 1, picks.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      setActive(Math.max(activeIndex - 1, -1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      event.stopPropagation()
      const player = picks[activeIndex]
      onPick(player.username, player.platform)
    }
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const username = value.trim()
    if (username) onPick(username, searchPlatform)
  }

  return (
    <div ref={bodyRef} onKeyDownCapture={onKeyDownCapture}>
      <PlayerSearchBar
        key={settled ? 'settled' : 'entering'}
        platform={searchPlatform}
        onPlatformChange={setSearchPlatform}
        name={INPUT_NAME}
        value={value}
        onChange={onChange}
        submitLabel="Go"
        onSubmit={onSubmit}
      />
      <PlayerPicks
        sections={sections}
        active={activeIndex}
        onActiveChange={setActive}
        onPick={(player) => onPick(player.username, player.platform)}
        id={listId}
      />
    </div>
  )
}

function SwitchPlayer({ platform }: { platform: Platform }) {
  const navigate = useNavigate()
  const page = useMatches({ select: (matches) => matches.at(-1)?.fullPath })
  const [opened, setOpened] = useState(false)
  // False while the modal slides in. The platform switch measures where
  // its highlight goes when it mounts, which mid-slide is the wrong spot,
  // and it only measures again on a click. So the search bar is mounted
  // again once the modal has settled.
  const [settled, setSettled] = useState(false)

  function open() {
    setSettled(false)
    setOpened(true)
  }

  useHotkeys([['/', open]])

  function goTo(username: string, playerPlatform: Platform) {
    setOpened(false)
    navigate({
      to: isPlayerPage(page) ? page : '/profile/$username',
      params: { username },
      search: platformSearch(playerPlatform),
    })
  }

  return (
    <>
      {/* Off while the modal is open: the pointer is still over the
          button underneath, so it would hang over the overlay. */}
      <Tooltip label="Switch player ( / )" openDelay={300} disabled={opened}>
        <Trigger type="button" onClick={open} aria-label="Switch player">
          <TbUserSearch size={13} aria-hidden />
          <span>Switch</span>
        </Trigger>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Switch player"
        centered
        radius="lg"
        size="lg"
        styles={brandModalStyles}
        transitionProps={{ onEntered: () => setSettled(true) }}
      >
        <SwitchPlayerBody platform={platform} settled={settled} onPick={goTo} />
      </Modal>
    </>
  )
}

export default SwitchPlayer
