import styled from 'styled-components'
import {
  FaGamepad,
  FaGlobe,
  FaHourglassHalf,
  FaTrophy,
  FaTwitch,
} from 'react-icons/fa'
import { BsClockHistory } from 'react-icons/bs'
import { SiChessdotcom, SiLichess } from 'react-icons/si'
import { RiVipDiamondFill } from 'react-icons/ri'
import { MdDateRange } from 'react-icons/md'
import { FiExternalLink } from 'react-icons/fi'
import { HiUserGroup } from 'react-icons/hi'
import { CgProfile } from 'react-icons/cg'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import useProfile from '../hooks/useProfile'
import PlatformBadge from '../ui/PlatformBadge'
import Spinner from '../ui/Spinner'
import { formatDate, formatDay, formatLastActive } from '../helpers/DateFormat'
import useStats from '../hooks/useStats'
import { upsertChessUser } from '../services/apiUser'
import usePlatform from '../hooks/usePlatform'
import { getTimeControls } from '../helpers/timeControls'
import { PLATFORM_LABELS, platformSearch } from '../helpers/platform'
import RecentGames from '../ui/RecentGames'
import { PageEyebrow } from '../ui/PageHeader'
import ProfileActions from '../ui/ProfileActions'
import PageError from '../ui/PageError'
import type { ReactNode } from 'react'
// ── Layout ──────────────────────────────────────────────────────────
// Two columns of equal height: identity + peak ratings on the left, a
// compact details list on the right.
const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 22rem);
  align-items: stretch;
  gap: 1.5rem;
  padding: 0.5rem 2rem 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: minmax(0, 1fr);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem;

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
`

const ProfileCard = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`

const SectionHeading = styled.h3`
  margin: 0 0 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

// "<icon> PROFILE" above both cards. The identity card below already is
// the player header, so this page takes only the eyebrow.
const EyebrowRow = styled.div`
  grid-column: 1 / -1;
  margin-bottom: -0.5rem;
`

// Full width under both cards.
const RecentGamesPanel = styled(Panel)`
  grid-column: 1 / -1;
  padding-top: 1.4rem;
  padding-bottom: 1.4rem;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;

  ${SectionHeading} {
    margin: 0;
  }
`

const SeeAll = styled.span`
  a {
    font-size: 0.82rem;
    font-weight: 600;
    color: light-dark(var(--brand), var(--brand-soft));
    text-decoration: none;
    opacity: 0.85;
  }

  a:hover,
  a:focus-visible {
    opacity: 1;
    text-decoration: underline;
  }
`

// ── Identity header ─────────────────────────────────────────────────

const Identity = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`

const AvatarLink = styled.a`
  flex-shrink: 0;
  border-radius: 50%;
  /* Thin ring with a gap, so the photo reads as a clean circle against
     the card instead of blending into it. */
  padding: 4px;
  border: 1.5px solid rgba(187, 247, 208, 0.35);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(187, 247, 208, 0.7);
  }

  [data-mantine-color-scheme='light'] & {
    border-color: rgba(20, 83, 45, 0.35);
  }
`

const Avatar = styled.img`
  display: block;
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 6rem;
    height: 6rem;
  }
`

const AvatarPlaceholder = styled.div`
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    width: 6rem;
    height: 6rem;
  }
`

const IdentityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;

  @media (max-width: 768px) {
    align-items: center;
  }
`

const NameLine = styled.a`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;

  @media (max-width: 768px) {
    justify-content: center;
  }
`

const DisplayName = styled.h1`
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const ChessTitle = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: #7d2828;
  color: white;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
`

const SubLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem 0.75rem;
  font-size: 0.95rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`

const Muted = styled.span`
  opacity: 0.6;
`

const Dot = styled.span`
  opacity: 0.35;

  /* The sub-line wraps on phones; a separator would dangle at a line end. */
  @media (max-width: 768px) {
    display: none;
  }
`

const Country = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  opacity: 0.8;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`

// ── Peak ratings ────────────────────────────────────────────────────

// One column per time control so the cards always fill the row (no empty
// slot after the last one on wide windows), dropping to two columns where
// that would make them too narrow. With only one or two time controls
// (common on lichess) the columns are capped so the cards don't stretch
// into wide slabs.
const PeakGrid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: ${({ $count }) =>
    $count <= 2
      ? `repeat(${$count}, minmax(0, 18rem))`
      : `repeat(${$count}, minmax(0, 1fr))`};
  gap: 0.85rem;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    gap: 0.65rem;
  }
`

const PeakCard = styled.a<{ $accent: string }>`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.15rem 1.2rem 1rem;
  border-radius: 14px;

  @media (max-width: 768px) {
    padding: 0.95rem 0.9rem 0.85rem;
  }

  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  /* Time-control accent: a thin bar along the top edge. */
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: ${({ $accent }) => $accent};
    opacity: 0.85;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(
      in srgb,
      ${({ $accent }) => $accent} 45%,
      transparent
    );
  }

  [data-mantine-color-scheme='light'] & {
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.6);
  }
`

const PeakLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.8;
`

const PeakRating = styled.div`
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const PeakFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  /* Two-up cards on phones are too narrow for both side by side. */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
`

const GapPill = styled.span<{ $atPeak: boolean }>`
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-weight: 600;
  color: ${({ $atPeak }) => ($atPeak ? '#22c55e' : 'inherit')};
  background: ${({ $atPeak }) =>
    $atPeak ? 'rgba(34, 197, 94, 0.14)' : 'rgba(255, 255, 255, 0.07)'};
  opacity: ${({ $atPeak }) => ($atPeak ? 1 : 0.75)};

  [data-mantine-color-scheme='light'] & {
    background: ${({ $atPeak }) =>
      $atPeak ? 'rgba(34, 197, 94, 0.14)' : 'rgba(0, 0, 0, 0.06)'};
  }
`

const PeakNote = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.6;
`

// ── Details panel ───────────────────────────────────────────────────

const DetailList = styled.dl`
  margin: 0;
  display: flex;
  flex-direction: column;
`

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:first-child {
    padding-top: 0.2rem;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  [data-mantine-color-scheme='light'] & {
    border-bottom-color: rgba(0, 0, 0, 0.07);
  }
`

const DetailIcon = styled.span<{ $accent: string }>`
  flex-shrink: 0;
  width: 1.7rem;
  height: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: ${({ $accent }) => $accent};
  background: color-mix(in srgb, ${({ $accent }) => $accent} 14%, transparent);
`

const DetailLabel = styled.dt`
  flex: 1;
  font-size: 0.85rem;
  opacity: 0.6;
  white-space: nowrap;
`

const DetailValue = styled.dd`
  margin: 0;
  min-width: 0;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  a {
    color: inherit;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  a:hover {
    text-decoration: underline;
  }
`

// ── Shared with Favorites / Games ───────────────────────────────────

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
`

export const TitleBadge = styled.span`
  font-size: 1rem;
  padding: 0.25rem 0.65rem;
  border-radius: 12px;
  background: #7d2828;
  font-weight: 1000;
  color: white;
  width: fit-content;

  [data-mantine-color-scheme='light'] & {
    color: white;
  }
`

export const Username = styled.div`
  font-size: 0.95rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const MetaRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`

function formatPlayTime(seconds: number) {
  const hours = Math.round(seconds / 3600)
  return `${hours.toLocaleString('en-IN')} hours`
}

function Profile() {
  const { username } = useParams({ from: '/profile/$username' })
  const platform = usePlatform()
  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useProfile(username, platform)
  const upsertMutation = useMutation({ mutationFn: upsertChessUser })
  const {
    data: stats,
    isPending: isFetchingStats,
    error: errorStats,
  } = useStats(username, platform)

  useEffect(() => {
    if (!profile) return
    upsertMutation.mutate(profile)
  }, [profile?.platform, profile?.playerId])

  // Without the profile there's no page; without the stats (chess.com's
  // /stats fails for some accounts) only the peak ratings are missing.
  if (errorProfile) return <PageError error={errorProfile} />

  if (isFetchingProfile || isFetchingStats) return <Spinner />

  const {
    avatar: playerAvatar = null,
    url = undefined,
    name: playerName = null,
    title = null,
    followers = null,
    lastOnline = null,
    joined = null,
    status = null,
    league = null,
    totalGames = null,
    playTimeSeconds = null,
    streamUrl = null,
    country = null,
  } = profile ?? {}

  const PlatformIcon = platform === 'lichess' ? SiLichess : SiChessdotcom

  // Rows render only when the platform actually reports that value, so
  // chess.com shows League/Status and lichess shows Games/Play Time.
  const details: Array<{
    icon: ReactNode
    label: string
    accent: string
    value: ReactNode
    title?: string
    show: boolean
  }> = [
    {
      icon: <HiUserGroup size={16} />,
      label: 'Followers',
      accent: '#06b6d4',
      value: followers?.toLocaleString('en-IN'),
      show: followers != null,
    },
    {
      icon: <MdDateRange size={16} />,
      label: 'Joined',
      accent: '#22c55e',
      value: joined ? formatDay(joined) : '—',
      title: joined ? formatDate(joined).formattedDateTime : undefined,
      show: true,
    },
    {
      icon: <FaTrophy size={14} />,
      label: 'League',
      accent: '#f59e0b',
      value: league || '—',
      show: platform === 'chess.com',
    },
    {
      icon: <RiVipDiamondFill size={15} />,
      label: 'Status',
      accent: '#3b82f6',
      value: status ? status.charAt(0).toUpperCase() + status.slice(1) : '—',
      show: platform === 'chess.com',
    },
    {
      icon: <FaGamepad size={16} />,
      label: 'Games played',
      accent: '#22c55e',
      value: totalGames?.toLocaleString('en-IN'),
      show: totalGames != null,
    },
    {
      icon: <FaHourglassHalf size={14} />,
      label: 'Play time',
      accent: '#3b82f6',
      value: playTimeSeconds != null ? formatPlayTime(playTimeSeconds) : '—',
      show: playTimeSeconds != null,
    },
    {
      icon: <BsClockHistory size={15} />,
      label: 'Last active',
      accent: '#eab308',
      value: lastOnline ? formatLastActive(lastOnline) : '—',
      title: lastOnline ? formatDate(lastOnline).formattedDateTime : undefined,
      show: true,
    },
    {
      icon: <FaTwitch size={15} />,
      label: 'Stream',
      accent: '#a855f7',
      value: streamUrl ? (
        <a href={streamUrl} target="_blank" rel="noopener noreferrer">
          {streamUrl.replace(/^https?:\/\/(www\.)?/, '')}
          <FiExternalLink size={12} />
        </a>
      ) : null,
      show: streamUrl != null,
    },
  ]

  const timeControls = getTimeControls(platform)
  const handle = profile?.username ?? username
  const peakCount = timeControls.filter(
    ({ timeClass }) => stats?.[timeClass]?.best,
  ).length

  return (
    <PageWrapper>
      <EyebrowRow>
        <PageEyebrow icon={CgProfile} section="Profile" />
      </EyebrowRow>

      <ProfileCard>
        <Identity>
          <AvatarLink href={url} target="_blank" rel="noopener noreferrer">
            {playerAvatar ? (
              <Avatar src={playerAvatar} alt={playerName || handle} />
            ) : (
              <AvatarPlaceholder>
                <PlatformIcon size={40} />
              </AvatarPlaceholder>
            )}
          </AvatarLink>

          <IdentityText>
            <NameLine href={url} target="_blank" rel="noopener noreferrer">
              {title && <ChessTitle>{title}</ChessTitle>}
              <DisplayName>{playerName || handle}</DisplayName>
            </NameLine>
            <SubLine>
              {playerName && <Muted>@{handle}</Muted>}
              <PlatformBadge platform={platform} />
              {country && (
                <>
                  <Dot>•</Dot>
                  <Country>
                    {country.code === 'XX' ? (
                      <FaGlobe size={16} />
                    ) : (
                      <img
                        src={`https://flagsapi.com/${country.code}/flat/32.png`}
                        alt=""
                      />
                    )}
                    {country.name}
                  </Country>
                </>
              )}
            </SubLine>
          </IdentityText>

          {profile && <ProfileActions profile={profile} />}
        </Identity>

        <section>
          <SectionHeading>Peak ratings</SectionHeading>
          {errorStats && (
            <PeakNote>
              {PLATFORM_LABELS[platform]} didn't return this player's
              ratings right now.
            </PeakNote>
          )}
          <PeakGrid $count={peakCount}>
            {timeControls.map(({ timeClass, label, color, icon: Icon }) => {
              const stat = stats?.[timeClass]
              if (!stat?.best) return null
              const gap =
                stat.current != null ? stat.best.rating - stat.current : null
              return (
                <PeakCard
                  key={timeClass}
                  $accent={color}
                  href={stat.best.gameUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PeakLabel>
                    <Icon size={16} color={color} />
                    {label}
                  </PeakLabel>
                  <PeakRating>{stat.best.rating}</PeakRating>
                  {stat.current != null && gap != null && (
                    <PeakFooter>
                      <Muted>Current {stat.current}</Muted>
                      <GapPill $atPeak={gap <= 0}>
                        {gap <= 0 ? 'At peak' : `−${gap}`}
                      </GapPill>
                    </PeakFooter>
                  )}
                </PeakCard>
              )
            })}
          </PeakGrid>
        </section>
      </ProfileCard>

      <Panel>
        <SectionHeading>Details</SectionHeading>
        <DetailList>
          {details
            .filter((detail) => detail.show)
            .map((detail) => (
              <DetailRow key={detail.label}>
                <DetailIcon $accent={detail.accent}>{detail.icon}</DetailIcon>
                <DetailLabel>{detail.label}</DetailLabel>
                <DetailValue title={detail.title}>{detail.value}</DetailValue>
              </DetailRow>
            ))}
        </DetailList>
      </Panel>

      <RecentGamesPanel as="section">
        <SectionHeader>
          <SectionHeading>Recent games</SectionHeading>
          <SeeAll>
            <Link
              to="/games/$username"
              params={{ username }}
              search={{
                year: undefined,
                month: undefined,
                day: undefined,
                ...platformSearch(platform),
              }}
            >
              See all games →
            </Link>
          </SeeAll>
        </SectionHeader>
        <RecentGames username={username} platform={platform} />
      </RecentGamesPanel>
    </PageWrapper>
  )
}

export default Profile
