// Two players side by side: their ratings in each time control, and both
// rating histories on one chart. Either player can be from either site.
// The players live in the URL, so a comparison can be shared or reloaded.
import styled from 'styled-components'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { SegmentedControl } from '@mantine/core'
import { TbArrowsLeftRight, TbX } from 'react-icons/tb'
import { FaGlobe } from 'react-icons/fa'
import { SiChessdotcom, SiLichess } from 'react-icons/si'
import useProfile from '../hooks/useProfile'
import useStats from '../hooks/useStats'
import useGoogleUser from '../hooks/useGoogleUser'
import useGetFavsofUser from '../hooks/useGetFavsofUser'
import useFetchChessProfileBulk from '../hooks/useFetchChessProfileBulk'
import useGamesRecentdays from '../hooks/useGamesRecentdays'
import { useProgressiveTransform } from '../hooks/useProgressiveTransform'
import {
  comparedPlayer,
  samePlayer,
  slotSearch,
} from '../helpers/compareSearch'
import { compareStats, mergeTimeControls } from '../helpers/compareStats'
import { calculateRatingHistory } from '../helpers/calculateRatingHistory'
import { getTimeControls } from '../helpers/timeControls'
import {
  DEFAULT_PLATFORM,
  PLATFORM_LABELS,
  parsePlatform,
  platformSearch,
} from '../helpers/platform'
import { PageEyebrow } from '../ui/PageHeader'
import PlatformBadge from '../ui/PlatformBadge'
import PlayerSearchBar from '../ui/PlayerSearchBar'
import { brandToggleStyles } from '../ui/PlatformToggle'
import CompareRatingChart from '../ui/CompareRatingChart'
import { Pulse } from '../ui/DashboardSkeleton'
import { describeError } from '../ui/PageError'
import type { CompareSearch, ComparedPlayer } from '../helpers/compareSearch'
import type { CompareMetric, Side } from '../helpers/compareStats'
import type { TransformedGame } from '../helpers/transformGame'
import type { TimeControlConfig } from '../helpers/timeControls'
import type { Platform } from '../helpers/platform'

// One colour per player, used for their slot, their leading numbers and
// their line on the chart. Teal and violet stay apart in both themes and
// for the common colour-vision deficiencies.
const SIDE_COLORS: Record<Side, string> = { a: '#14b8a6', b: '#8b5cf6' }

const EXAMPLES: Array<ComparedPlayer> = [
  { username: 'Hikaru', platform: 'chess.com' },
  { username: 'MagnusCarlsen', platform: 'chess.com' },
  { username: 'DrNykterstein', platform: 'lichess' },
]

// The platform switch's green look, a size down.
const toggleStyles = {
  ...brandToggleStyles,
  root: { ...brandToggleStyles.root, padding: 3 },
  label: { fontWeight: 600, padding: '0.2rem 0.8rem' },
}

const RANGES = [
  { value: '90D', label: '90 days', days: 90 },
  { value: '1Y', label: '1 year', days: 365 },
] as const

// ── Layout ──────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.5rem 2rem 1.5rem;

  @media (max-width: 768px) {
    padding: 0.5rem 0;
    gap: 1rem;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  & > :first-child {
    margin-bottom: 0.25rem;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const Subtitle = styled.p`
  margin: 0;
  opacity: 0.6;
`

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 768px) {
    padding: 1.1rem;
  }
`

const SectionHeading = styled.h2`
  margin: 0;
  font-size: 0.75rem !important;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

const SectionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1rem;
`

const Muted = styled.span`
  opacity: 0.6;
`

// ── Player slots ────────────────────────────────────────────────────

const Slots = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  gap: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const SlotPanel = styled(Panel)<{ $color: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.9rem;
  min-height: 9.5rem;
  overflow: hidden;

  /* The player's colour, as on the chart. */
  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: ${({ $color }) => $color};
  }
`

const SlotLabel = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`

const Between = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  @media (max-width: 1100px) {
    flex-direction: row;
  }
`

const Versus = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  opacity: 0.5;
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid light-dark(rgba(0, 0, 0, 0.14), rgba(255, 255, 255, 0.14));
  background: light-dark(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.04));
  color: inherit;
  cursor: pointer;

  &:hover:not(:disabled),
  &:focus-visible {
    background: light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.1));
  }

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
`

const Chips = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.82rem;
`

const Chip = styled.button`
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--brand-border);
  background: transparent;
  color: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.85;

  &:hover,
  &:focus-visible {
    opacity: 1;
    background: light-dark(rgba(20, 83, 45, 0.08), rgba(187, 247, 208, 0.08));
  }

  small {
    opacity: 0.6;
  }
`

const Picked = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
`

const Avatar = styled.img`
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px var(--brand-border-soft);
`

const AvatarFallback = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: rgba(127, 127, 127, 0.12);
`

const PickedText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  flex: 1;
`

const NameLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;

  a {
    color: inherit;
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  a:hover,
  a:focus-visible {
    text-decoration: underline;
  }
`

const ChessTitle = styled.span`
  flex-shrink: 0;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  background: #7d2828;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;

  && {
    color: white;
  }
`

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
  font-size: 0.85rem;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`

const SlotError = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.75;
`

// ── Ratings by time control ─────────────────────────────────────────

const Blocks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  gap: 1rem;
`

const Block = styled.div<{ $accent: string }>`
  position: relative;
  overflow: hidden;
  padding: 1rem 1.1rem 0.6rem;
  border-radius: 14px;
  border: 1px solid light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.07));
  background: light-dark(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.03));

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: ${({ $accent }) => $accent};
    opacity: 0.85;
  }
`

const BlockTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
`

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.45rem 0;
  border-top: 1px solid
    light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.06));
  font-variant-numeric: tabular-nums;
`

const MetricLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.5;
`

const MetricValue = styled.span<{
  $lead: boolean
  $color: string
  $end?: boolean
}>`
  font-size: 1.05rem;
  font-weight: ${({ $lead }) => ($lead ? 800 : 600)};
  text-align: ${({ $end }) => ($end ? 'right' : 'left')};
  opacity: ${({ $lead }) => ($lead ? 1 : 0.75)};

  && {
    color: ${({ $lead, $color }) => ($lead ? $color : 'inherit')};
  }
`

// Which column is whose, above the blocks.
const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
`

const LegendItem = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    width: 14px;
    height: 3px;
    border-radius: 2px;
    background: ${({ $color }) => $color};
  }
`

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`

const Note = styled.p`
  margin: 0;
  padding: 1.5rem 0.25rem;
  font-size: 0.9rem;
  opacity: 0.6;
`

// ── Helpers ─────────────────────────────────────────────────────────

function formatMetric(key: CompareMetric['key'], value: number | null) {
  if (value == null) return '—'
  if (key === 'winRate') return `${value.toFixed(1)}%`
  return value.toLocaleString('en-IN')
}

function playerLabel(player: ComparedPlayer) {
  return player.username
}

// ── Slots ───────────────────────────────────────────────────────────

function EmptySlot({
  side,
  other,
  onPick,
}: {
  side: Side
  other: ComparedPlayer | null
  onPick: (player: ComparedPlayer) => void
}) {
  const [platform, setPlatform] = useState<Platform>(DEFAULT_PLATFORM)
  const [username, setUsername] = useState('')

  const { data: googleUser } = useGoogleUser()
  const sub = googleUser?.sub ?? ''
  const { data: favs } = useGetFavsofUser(sub)
  // Same keys as the favourites page, so the two share one cached query.
  const favKeys =
    favs?.map((fav) => ({
      player_id: String(fav.player_id),
      platform: parsePlatform(fav.platform),
    })) ?? []
  const { data: favProfiles } = useFetchChessProfileBulk(favKeys)

  const favPlayers: Array<ComparedPlayer> = (favProfiles ?? []).map((fav) => ({
    username: fav.username,
    platform: parsePlatform(fav.platform),
  }))
  const suggestions = (favPlayers.length ? favPlayers : EXAMPLES)
    .filter((player) => !other || !samePlayer(player, other))
    .slice(0, 8)

  return (
    <>
      <SlotLabel $color={SIDE_COLORS[side]}>
        {side === 'a' ? 'First player' : 'Second player'}
      </SlotLabel>
      <PlayerSearchBar
        platform={platform}
        onPlatformChange={setPlatform}
        name={`compare-player-${side}`}
        value={username}
        onChange={setUsername}
        submitLabel="Add"
        placeholder="Username"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = username.trim()
          if (trimmed) onPick({ username: trimmed, platform })
        }}
      />
      {suggestions.length > 0 && (
        <Chips>
          <Muted>{favPlayers.length ? 'Favourites:' : 'Try:'}</Muted>
          {suggestions.map((player) => (
            <Chip
              key={`${player.platform}:${player.username}`}
              type="button"
              onClick={() => onPick(player)}
            >
              {player.username}
              {player.platform === 'lichess' && <small> · Lichess</small>}
            </Chip>
          ))}
        </Chips>
      )}
    </>
  )
}

function PickedSlot({
  side,
  player,
  onClear,
}: {
  side: Side
  player: ComparedPlayer
  onClear: () => void
}) {
  const {
    data: profile,
    isPending,
    error,
  } = useProfile(player.username, player.platform)
  const PlatformIcon = player.platform === 'lichess' ? SiLichess : SiChessdotcom

  const clearButton = (
    <IconButton
      type="button"
      onClick={onClear}
      aria-label={`Remove ${player.username}`}
      title="Pick someone else"
    >
      <TbX size={16} />
    </IconButton>
  )

  return (
    <>
      <SlotLabel $color={SIDE_COLORS[side]}>
        {side === 'a' ? 'First player' : 'Second player'}
      </SlotLabel>
      {isPending ? (
        <Picked>
          <Pulse $w="3.5rem" $h="3.5rem" $radius="50%" />
          <PickedText>
            <Pulse $w="12rem" $h="1.3rem" />
            <Pulse $w="8rem" $h="0.9rem" />
          </PickedText>
        </Picked>
      ) : error || !profile ? (
        <Picked>
          <PickedText>
            <strong>{player.username}</strong>
            <SlotError>{describeError(error).message}</SlotError>
          </PickedText>
          {clearButton}
        </Picked>
      ) : (
        <Picked>
          {profile.avatar ? (
            <Avatar src={profile.avatar} alt="" />
          ) : (
            <AvatarFallback>
              <PlatformIcon size={24} />
            </AvatarFallback>
          )}
          <PickedText>
            <NameLine>
              {profile.title && <ChessTitle>{profile.title}</ChessTitle>}
              <Link
                to="/profile/$username"
                params={{ username: profile.username }}
                search={platformSearch(player.platform)}
              >
                {profile.name || profile.username}
              </Link>
            </NameLine>
            <MetaLine>
              {profile.name && <Muted>@{profile.username}</Muted>}
              <PlatformBadge platform={player.platform} />
              {profile.country && (
                <Muted
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {profile.country.code === 'XX' ? (
                    <FaGlobe size={13} />
                  ) : (
                    <img
                      src={`https://flagsapi.com/${profile.country.code}/flat/32.png`}
                      alt=""
                    />
                  )}
                  {profile.country.name}
                </Muted>
              )}
            </MetaLine>
          </PickedText>
          {clearButton}
        </Picked>
      )}
    </>
  )
}

// ── Comparison ──────────────────────────────────────────────────────

function RatingBlocks({ a, b }: { a: ComparedPlayer; b: ComparedPlayer }) {
  const statsA = useStats(a.username, a.platform)
  const statsB = useStats(b.username, b.platform)

  const controls = mergeTimeControls(
    getTimeControls(a.platform),
    getTimeControls(b.platform),
  )
  const blocks = compareStats(statsA.data, statsB.data, controls)
  const isPending = statsA.isPending || statsB.isPending
  const failed = [
    statsA.error && a.username,
    statsB.error && b.username,
  ].filter(Boolean)

  return (
    <Panel as="section">
      <SectionTop>
        <SectionHeading>Ratings by time control</SectionHeading>
        <Legend>
          <LegendItem $color={SIDE_COLORS.a}>{playerLabel(a)}</LegendItem>
          <LegendItem $color={SIDE_COLORS.b}>{playerLabel(b)}</LegendItem>
        </Legend>
      </SectionTop>

      {a.platform !== b.platform && (
        <Note style={{ padding: '0 0 1rem' }}>
          Chess.com and Lichess ratings aren't on the same scale: Lichess
          numbers usually run higher for the same strength.
        </Note>
      )}

      {failed.length > 0 && (
        <Note style={{ padding: '0 0 1rem' }}>
          Couldn't load {failed.join(' and ')}'s ratings right now; their side
          shows "—".
        </Note>
      )}

      {isPending ? (
        <Blocks>
          {Array.from({ length: 3 }, (_, i) => (
            <Pulse key={i} $h="12.5rem" $radius="14px" />
          ))}
        </Blocks>
      ) : blocks.length === 0 ? (
        <Note>Neither player has rated games yet.</Note>
      ) : (
        <Blocks>
          {blocks.map(({ control, metrics }) => (
            <Block key={control.timeClass} $accent={control.color}>
              <BlockTitle>
                <control.icon size={15} color={control.color} aria-hidden />
                {control.label}
              </BlockTitle>
              {metrics.map((metric) => (
                <MetricRow key={metric.key}>
                  <MetricValue
                    $lead={metric.leader === 'a'}
                    $color={SIDE_COLORS.a}
                    aria-label={`${a.username}: ${formatMetric(metric.key, metric.a)}`}
                  >
                    {formatMetric(metric.key, metric.a)}
                  </MetricValue>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricValue
                    $lead={metric.leader === 'b'}
                    $color={SIDE_COLORS.b}
                    $end
                    aria-label={`${b.username}: ${formatMetric(metric.key, metric.b)}`}
                  >
                    {formatMetric(metric.key, metric.b)}
                  </MetricValue>
                </MetricRow>
              ))}
            </Block>
          ))}
        </Blocks>
      )}
    </Panel>
  )
}

function inRange(games: Array<TransformedGame> | undefined, days: number) {
  // The games cache can hold more than asked for (a longer range fetched
  // earlier is reused), so the range is applied here.
  const cutoff = Date.now() / 1000 - days * 24 * 60 * 60
  return games?.filter((game) => game.endTime >= cutoff)
}

function RatingTrend({
  a,
  b,
  timeClass,
  range,
  onTimeClass,
  onRange,
}: {
  a: ComparedPlayer
  b: ComparedPlayer
  timeClass: string | undefined
  range: (typeof RANGES)[number]
  onTimeClass: (timeClass: string) => void
  onRange: (range: string) => void
}) {
  const gamesA = useGamesRecentdays(a.username, range.value, a.platform)
  const gamesB = useGamesRecentdays(b.username, range.value, b.platform)
  const transformedA = useProgressiveTransform(
    gamesA.data,
    a.username,
    a.platform,
  )
  const transformedB = useProgressiveTransform(
    gamesB.data,
    b.username,
    b.platform,
  )

  const isLoading =
    gamesA.isPending ||
    gamesB.isPending ||
    transformedA.progress < 100 ||
    transformedB.progress < 100

  // Tabs for the time controls either player has games in, shared ones
  // first; the chart starts on the first one they share.
  const controls = mergeTimeControls(
    getTimeControls(a.platform),
    getTimeControls(b.platform),
  )
  const byA = transformedA.transformedData.byTimeClass
  const byB = transformedB.transformedData.byTimeClass
  const played = controls.filter(
    ({ timeClass: tc }) => byA[tc]?.length || byB[tc]?.length,
  )
  const shared = played.filter(
    ({ timeClass: tc }) => byA[tc]?.length && byB[tc]?.length,
  )
  const tabs = [...shared, ...played.filter((tc) => !shared.includes(tc))]
  // Undefined when neither player has games in the range.
  const active: TimeControlConfig | undefined =
    tabs.find((control) => control.timeClass === timeClass) ?? tabs.at(0)

  const history = useMemo(
    () =>
      calculateRatingHistory(
        {
          a: inRange(active ? byA[active.timeClass] : undefined, range.days),
          b: inRange(active ? byB[active.timeClass] : undefined, range.days),
        },
        ['a', 'b'],
      ),
    [active?.timeClass, byA, byB, range.days],
  )

  const loadingNote =
    a.platform === 'lichess' || b.platform === 'lichess'
      ? 'Loading games. Lichess sends them at about 20 a second, so a busy player can take up to a minute.'
      : 'Loading games…'

  return (
    <Panel as="section">
      <SectionTop>
        <SectionHeading>Rating over time</SectionHeading>
        <Controls>
          {tabs.length > 1 && (
            <SegmentedControl
              size="xs"
              radius="xl"
              color="transparent"
              styles={toggleStyles}
              classNames={{ label: 'platform-toggle-label' }}
              value={active?.timeClass}
              onChange={onTimeClass}
              data={tabs.map(({ timeClass: tc, label }) => ({
                value: tc,
                label,
              }))}
              aria-label="Time control"
            />
          )}
          <SegmentedControl
            size="xs"
            radius="xl"
            color="transparent"
            styles={toggleStyles}
            classNames={{ label: 'platform-toggle-label' }}
            value={range.value}
            onChange={onRange}
            data={RANGES.map(({ value, label }) => ({ value, label }))}
            aria-label="Range"
          />
        </Controls>
      </SectionTop>

      {gamesA.error || gamesB.error ? (
        <Note>{describeError(gamesA.error ?? gamesB.error).message}</Note>
      ) : isLoading ? (
        <>
          <Pulse $h="16rem" $radius="12px" />
          <Note style={{ paddingBottom: 0 }}>{loadingNote}</Note>
        </>
      ) : !active || history.rows.length < 2 ? (
        <Note>
          Not enough rated games in the last {range.label} to draw a trend.
        </Note>
      ) : (
        <>
          <Legend style={{ marginBottom: '0.75rem' }}>
            <LegendItem $color={SIDE_COLORS.a}>
              {playerLabel(a)}
              {!history.series.includes('a') && (
                <Muted> · no {active.label.toLowerCase()} games</Muted>
              )}
            </LegendItem>
            <LegendItem $color={SIDE_COLORS.b}>
              {playerLabel(b)}
              {!history.series.includes('b') && (
                <Muted> · no {active.label.toLowerCase()} games</Muted>
              )}
            </LegendItem>
          </Legend>
          <CompareRatingChart
            history={history}
            names={{ a: playerLabel(a), b: playerLabel(b) }}
            colors={SIDE_COLORS}
          />
        </>
      )}
    </Panel>
  )
}

// ── Page ────────────────────────────────────────────────────────────

function Compare() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/compare' })
  const a = comparedPlayer(search.a, search.ap)
  const b = comparedPlayer(search.b, search.bp)
  const range = RANGES.find(({ value }) => value === search.range) ?? RANGES[0]

  function update(next: CompareSearch) {
    navigate({ to: '/compare', search: { ...search, ...next }, replace: true })
  }

  const slots = { a, b }
  const same = a && b && samePlayer(a, b)

  return (
    <PageWrapper>
      <Header>
        <PageEyebrow icon={TbArrowsLeftRight} section="Compare" />
        <Title>Compare players</Title>
        <Subtitle>
          Put two players side by side, from Chess.com, Lichess or one of each.
        </Subtitle>
      </Header>

      <Slots>
        {(['a', 'b'] as const).map((side, index) => {
          const player = slots[side]
          const other = slots[side === 'a' ? 'b' : 'a']
          const slot = (
            <SlotPanel key={side} $color={SIDE_COLORS[side]}>
              {player ? (
                <PickedSlot
                  side={side}
                  player={player}
                  onClear={() => update(slotSearch(side, null))}
                />
              ) : (
                <EmptySlot
                  side={side}
                  other={other}
                  onPick={(picked) => update(slotSearch(side, picked))}
                />
              )}
            </SlotPanel>
          )
          if (index === 0) return slot
          return [
            <Between key="between">
              <Versus>VS</Versus>
              <IconButton
                type="button"
                disabled={!a && !b}
                onClick={() =>
                  update({ ...slotSearch('a', b), ...slotSearch('b', a) })
                }
                aria-label="Swap players"
                title="Swap players"
              >
                <TbArrowsLeftRight size={16} />
              </IconButton>
            </Between>,
            slot,
          ]
        })}
      </Slots>

      {same ? (
        <Note>
          Both slots hold {a.username} on {PLATFORM_LABELS[a.platform]}. Pick
          someone else for one of them.
        </Note>
      ) : a && b ? (
        <>
          <RatingBlocks a={a} b={b} />
          <RatingTrend
            a={a}
            b={b}
            timeClass={search.tc}
            range={range}
            onTimeClass={(tc) => update({ tc })}
            onRange={(value) =>
              update({ range: value === '1Y' ? '1Y' : undefined })
            }
          />
        </>
      ) : (
        <Note>
          Pick {a || b ? 'one more player' : 'two players'} to see their
          ratings, records and rating history side by side.
        </Note>
      )}
    </PageWrapper>
  )
}

export default Compare
