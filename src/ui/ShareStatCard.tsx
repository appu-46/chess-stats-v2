// "Share" on the profile: draws the player's stat card as an image and
// offers it to download, copy, or send through the device's share sheet,
// plus links that post a summary and the profile's address to social
// sites.
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { Modal, Tooltip } from '@mantine/core'
import {
  TbCheck,
  TbCopy,
  TbDownload,
  TbLink,
  TbMail,
  TbShare,
} from 'react-icons/tb'
import {
  SiBluesky,
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiReddit,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from 'react-icons/si'
import useLatestGames from '../hooks/useLatestGames'
import { getTimeControls } from '../helpers/timeControls'
import { newestGames } from '../helpers/newestGames'
import { PLATFORM_LABELS, platformSearch } from '../helpers/platform'
import { SHARE_TARGET_LABELS, shareLink } from '../helpers/shareLinks'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  drawStatCard,
  loadImage,
} from '../helpers/drawStatCard'
import { RECENT_GAMES_FETCHED } from './RecentGames'
import { Pulse } from './DashboardSkeleton'
import type { PlayerProfile, PlayerStats } from '../helpers/normalizePlayer'
import type { StatCardData } from '../helpers/drawStatCard'
import type { SharePost, ShareTarget } from '../helpers/shareLinks'
import type { IconType } from 'react-icons'

const FORM_GAMES = 10
const MAX_RATINGS = 4

const Preview = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: ${CARD_WIDTH} / ${CARD_HEIGHT};
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`

const action = `
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.4rem;
  padding: 0 1.05rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;

  &[aria-disabled='true'] {
    pointer-events: none;
    opacity: 0.5;
  }
`

const Primary = styled.a`
  ${action}
  border: none;
  background: var(--brand-fill);

  && {
    color: var(--on-brand);
  }

  &:hover,
  &:focus-visible {
    background: var(--brand-fill-hover);
  }
`

const Secondary = styled.button`
  ${action}
  color: inherit;
  background: transparent;
  border: 1px solid light-dark(rgba(0, 0, 0, 0.14), rgba(255, 255, 255, 0.16));

  &:hover,
  &:focus-visible {
    background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.06));
  }
`

const SectionLabel = styled.div`
  margin: 1.1rem 0 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

const Targets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

// A round button in the site's brand colour. X's brand is black/white,
// so it takes the text colour instead.
const targetStyle = (color: string) => `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1px solid light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.14));
  background: transparent;
  cursor: pointer;

  && {
    color: ${color};
  }

  &:hover,
  &:focus-visible {
    border-color: color-mix(in srgb, ${color} 55%, transparent);
    background: color-mix(in srgb, ${color} 14%, transparent);
  }
`

const TargetLink = styled.a<{ $color: string }>`
  ${({ $color }) => targetStyle($color)}
`

const TargetButton = styled.button<{ $color: string }>`
  ${({ $color }) => targetStyle($color)}
`

const Notice = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  opacity: 0.7;
`

const Failure = styled.p`
  margin: 0;
  opacity: 0.7;
`

function cardData(
  profile: PlayerProfile,
  stats: PlayerStats | undefined,
  form: StatCardData['form'],
): StatCardData {
  const ratings = getTimeControls(profile.platform)
    .flatMap((control) => {
      const stat = stats?.[control.timeClass]
      return stat?.current != null
        ? [{ control, current: stat.current, peak: stat.best?.rating ?? null }]
        : []
    })
    .slice(0, MAX_RATINGS)

  return {
    displayName: profile.name || profile.username,
    handle: profile.name ? profile.username : null,
    title: profile.title,
    platformLabel: PLATFORM_LABELS[profile.platform],
    country:
      profile.country?.code === 'XX' ? null : (profile.country?.name ?? null),
    ratings,
    form,
    site: window.location.host,
  }
}

const TARGETS: Array<{ id: ShareTarget; icon: IconType; color: string }> = [
  { id: 'x', icon: SiX, color: 'currentColor' },
  { id: 'reddit', icon: SiReddit, color: '#ff4500' },
  { id: 'whatsapp', icon: SiWhatsapp, color: '#25d366' },
  { id: 'telegram', icon: SiTelegram, color: '#26a5e4' },
  { id: 'facebook', icon: SiFacebook, color: '#1877f2' },
  { id: 'linkedin', icon: SiLinkedin, color: '#0a66c2' },
  { id: 'bluesky', icon: SiBluesky, color: '#1185fe' },
  { id: 'email', icon: TbMail, color: 'currentColor' },
]

const INSTAGRAM_COLOR = '#e4405f'

// "Hikaru Nakamura on Chess.com: Blitz 3482 · Rapid 2838 · Bullet 3401",
// linking to their profile here.
function sharePost(profile: PlayerProfile, data: StatCardData): SharePost {
  const name = data.displayName
  const ratings = data.ratings
    .slice(0, 3)
    .map(({ control, current }) => `${control.label} ${current}`)
    .join(' · ')
  const search = new URLSearchParams(platformSearch(profile.platform))
  const query = search.toString()
  const url = `${window.location.origin}/profile/${encodeURIComponent(profile.username)}${query ? `?${query}` : ''}`
  return {
    text: `${name} on ${data.platformLabel}${ratings ? `: ${ratings}` : ''}`,
    url,
    title: `${name}'s chess stats`,
  }
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No image'))),
      'image/png',
    ),
  )
}

function StatCardModal({
  profile,
  stats,
  username,
  opened,
  onClose,
}: {
  profile: PlayerProfile
  stats: PlayerStats | undefined
  // As in the URL: the profile's recent games are cached under it.
  username: string
  opened: boolean
  onClose: () => void
}) {
  const { games, isPending: gamesPending } = useLatestGames(
    username,
    RECENT_GAMES_FETCHED,
    profile.platform,
  )
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState<'image' | 'link' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Redrawn whenever it's opened, so it shows the latest numbers.
  useEffect(() => {
    if (!opened || gamesPending) return
    let cancelled = false
    let url: string | null = null
    // The last drawing's URL was revoked on close.
    setImage(null)
    setFailed(false)
    setNotice(null)

    const form = games
      ? newestGames(games, username.toLowerCase(), profile.platform, FORM_GAMES)
          .reverse()
          .map((game) => game.resultForPlayer)
      : []

    Promise.all([loadImage(profile.avatar), loadImage('/knight-dark.svg')])
      .then(async ([avatar, logo]) => {
        const canvas = document.createElement('canvas')
        drawStatCard(canvas, cardData(profile, stats, form), avatar, logo)
        const blob = await canvasBlob(canvas)
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setImage({ blob, url })
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [opened, gamesPending, games, profile, stats, username])

  const fileName = `${profile.username}-chess-stats.png`
  const file = image
    ? new File([image.blob], fileName, { type: 'image/png' })
    : null
  const canShare =
    !!file && typeof navigator.canShare === 'function'
      ? navigator.canShare({ files: [file] })
      : false
  // Both are missing outside secure (https) pages and in some browsers.
  const canCopy =
    typeof ClipboardItem !== 'undefined' && 'clipboard' in navigator

  async function copy() {
    if (!image) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': image.blob }),
      ])
      setCopied('image')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error(error)
    }
  }

  // Ratings for the post text don't depend on the drawing, so the links
  // work before the image is ready.
  const post = sharePost(profile, cardData(profile, stats, []))

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(post.url)
      setCopied('link')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error(error)
    }
  }

  // Instagram only takes posts from its app: on phones that's the share
  // sheet, elsewhere the card is saved to post from there.
  function instagram() {
    if (canShare) {
      void share()
      return
    }
    if (!image) return
    const link = document.createElement('a')
    link.href = image.url
    link.download = fileName
    link.click()
    setNotice(
      "Instagram only takes posts from its app, so the card's been downloaded to post from there.",
    )
  }

  async function share() {
    if (!file) return
    try {
      await navigator.share({
        files: [file],
        title: `${profile.name || profile.username} · Chess Stats`,
      })
    } catch {
      // Closing the share sheet rejects too; nothing to do.
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Share stat card"
      size="xl"
      radius="lg"
      centered
    >
      {failed ? (
        <Failure>Couldn't draw the card. Try again in a moment.</Failure>
      ) : image ? (
        <Preview src={image.url} alt={`Stat card for ${profile.username}`} />
      ) : (
        <Pulse
          $h="auto"
          $radius="12px"
          style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
        />
      )}
      <SectionLabel>Share to</SectionLabel>
      <Targets>
        {TARGETS.map(({ id, icon: Icon, color }) => (
          <Tooltip key={id} label={SHARE_TARGET_LABELS[id]} openDelay={150}>
            <TargetLink
              $color={color}
              href={shareLink(id, post)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${SHARE_TARGET_LABELS[id]}`}
            >
              <Icon size={18} aria-hidden />
            </TargetLink>
          </Tooltip>
        ))}
        <Tooltip label="Instagram" openDelay={150}>
          <TargetButton
            type="button"
            $color={INSTAGRAM_COLOR}
            onClick={instagram}
            disabled={!image}
            aria-label="Share on Instagram"
          >
            <SiInstagram size={18} aria-hidden />
          </TargetButton>
        </Tooltip>
      </Targets>
      {notice && <Notice>{notice}</Notice>}

      <Actions>
        {canShare && (
          <Secondary type="button" onClick={share}>
            <TbShare size={16} aria-hidden />
            Share…
          </Secondary>
        )}
        {'clipboard' in navigator && (
          <Secondary type="button" onClick={copyLink}>
            {copied === 'link' ? (
              <TbCheck size={16} aria-hidden />
            ) : (
              <TbLink size={16} aria-hidden />
            )}
            {copied === 'link' ? 'Link copied' : 'Copy link'}
          </Secondary>
        )}
        {canCopy && (
          <Secondary type="button" onClick={copy} disabled={!image}>
            {copied === 'image' ? (
              <TbCheck size={16} aria-hidden />
            ) : (
              <TbCopy size={16} aria-hidden />
            )}
            {copied === 'image' ? 'Copied' : 'Copy image'}
          </Secondary>
        )}
        <Primary href={image?.url} download={fileName} aria-disabled={!image}>
          <TbDownload size={16} aria-hidden />
          Download PNG
        </Primary>
      </Actions>
    </Modal>
  )
}

// The button, styled by the caller to match the actions beside it. The
// modal (and its game fetch) only mounts once it's been opened.
function ShareStatCard({
  profile,
  stats,
  username,
  className,
}: {
  profile: PlayerProfile
  stats: PlayerStats | undefined
  username: string
  className?: string
}) {
  const [opened, setOpened] = useState(false)
  const [mounted, setMounted] = useState(false)

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setMounted(true)
          setOpened(true)
        }}
        aria-label={`Share a stat card for ${profile.username}`}
      >
        <TbShare size={14} aria-hidden />
        <span>Share</span>
      </button>
      {mounted && (
        <StatCardModal
          profile={profile}
          stats={stats}
          username={username}
          opened={opened}
          onClose={() => setOpened(false)}
        />
      )}
    </>
  )
}

export default ShareStatCard
