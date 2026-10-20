import styled from 'styled-components'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import {
  FaCalendarDay,
  FaChartPie,
  FaChessKing,
  FaGamepad,
  FaShieldAlt,
} from 'react-icons/fa'
import { SiTarget } from 'react-icons/si'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import useProfile from '../hooks/useProfile'
import usePlatform from '../hooks/usePlatform'
import { platformSearch } from '../helpers/platform'
import useArchiveMonths from '../hooks/useArchiveMonths'
import useGames from '../hooks/useGames'
import { useProgressiveTransform } from '../hooks/useProgressiveTransform'
import Spinner from '../ui/Spinner'
import { parseDayKey } from '../helpers/DateFormat'
import PlatformBadge from '../ui/PlatformBadge'
import {
  RESULT_COLORS,
  RESULT_LABELS,
  ResultIcon,
  ResultPill,
  SideDot,
} from '../ui/GameResult'
import { formatTimeControl, shortTermination } from '../helpers/gameFormat'
import { TitleBadge } from './Profile'
import type { Result } from '../ui/GameResult'

// ─── Game list styled components ──────────────────────────────────────────────

const RowResultPill = styled(ResultPill)`
  @media (max-width: 768px) {
    grid-area: result;
  }
`

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.5rem 1rem 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem 0 1rem;
  }
`

// Styles the router <Link> inside it; styled(Link) would lose the route
// typing of its params and search.
const BackLink = styled.div`
  a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: inherit;
    text-decoration: none;
    opacity: 0.6;
  }

  a:hover,
  a:focus-visible {
    opacity: 1;
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem 2rem;
`

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`

const PageSubtitle = styled.p`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;

  /* Dim the text only; the icons keep their full colour. */
  & > span {
    opacity: 0.78;
  }
`

const SubtitleItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  && {
    opacity: 1;
  }

  /* The text only; the icon badge stays at full strength. */
  & > span:last-child {
    opacity: 0.78;
  }
`

// Same tinted badge as the summary icons, smaller and tighter for the
// subtitle line.
const SubtitleIcon = styled.span<{ $accent: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 7px;
  color: ${({ $accent }) => $accent};
  background: color-mix(in srgb, ${({ $accent }) => $accent} 16%, transparent);
`

const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.75rem;
`

// Icon badge beside a label-over-value stack, like the dashboard's cards.
const SummaryItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.65rem;

  /* Faint hairline between stats, centred in the gap. Hidden on phones,
     where the stats wrap and a divider could end up at a line end. */
  & + &::before {
    content: '';
    position: absolute;
    left: -0.875rem;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: rgba(255, 255, 255, 0.12);
  }

  [data-mantine-color-scheme='light'] & + &::before {
    background: rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    & + &::before {
      display: none;
    }
  }
`

// Label and value centred on each other, so the short labels sit over the
// middle of wider values like "41.5 / 42".
const SummaryText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  text-align: center;
`

const SummaryIcon = styled.span<{ $accent: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  color: ${({ $accent }) => $accent};
  background: color-mix(in srgb, ${({ $accent }) => $accent} 16%, transparent);
`

const SummaryLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.68;
`

const SummaryValue = styled.span`
  font-size: 1.35rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const FilterChip = styled.button<{ $active: boolean; $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $active }) => ($active ? 'var(--on-brand)' : 'inherit')};
  background: ${({ $active }) =>
    $active ? 'var(--brand-fill)' : 'transparent'};
  border: 1px solid
    ${({ $active }) => ($active ? 'transparent' : 'var(--brand-border)')};
  opacity: ${({ $active }) => ($active ? 1 : 0.8)};

  &:hover {
    opacity: 1;
  }

  &::before {
    content: '';
    display: ${({ $color }) => ($color ? 'block' : 'none')};
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`

const ChipCount = styled.span`
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
`

// Neutral (not green) so the green page doesn't show through and blur
// with the green win rows; the result tints are the only colour inside.
const Panel = styled.div`
  border-radius: 16px;
  background: #121517;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  padding: 0.75rem;

  [data-mantine-color-scheme='light'] & {
    background: #fbfcfc;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`

const COLUMNS =
  '6rem minmax(0, 1.4fr) minmax(0, 1.6fr) 5.5rem 4rem 4.5rem 1.5rem'
// Mid widths: narrower numeric columns so names and openings keep room.
const COLUMNS_MID =
  '6rem minmax(0, 1.5fr) minmax(0, 1.3fr) 3.75rem 3rem 3.5rem 1rem'

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${COLUMNS};
  gap: 1rem;
  padding: 0.25rem 1rem 0.6rem;

  @media (max-width: 1100px) {
    grid-template-columns: ${COLUMNS_MID};
    gap: 0.75rem;
  }
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.62;

  @media (max-width: 768px) {
    display: none;
  }
`

const GamesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 68vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

  @media (max-width: 768px) {
    max-height: none;
    overflow: visible;
  }
`

const GameRow = styled.a<{ $result: Result }>`
  display: grid;
  grid-template-columns: ${COLUMNS};
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  /* A faint wash of the result colour, plus a solid bar on the left edge. */
  background: color-mix(
    in srgb,
    ${({ $result }) => RESULT_COLORS[$result]} 7%,
    transparent
  );
  border: 1px solid
    color-mix(
      in srgb,
      ${({ $result }) => RESULT_COLORS[$result]} 16%,
      transparent
    );
  box-shadow: inset 3px 0 0 ${({ $result }) => RESULT_COLORS[$result]};

  &:hover,
  &:focus-visible {
    background: color-mix(
      in srgb,
      ${({ $result }) => RESULT_COLORS[$result]} 13%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      ${({ $result }) => RESULT_COLORS[$result]} 35%,
      transparent
    );
  }

  [data-mantine-color-scheme='light'] & {
    background: color-mix(
      in srgb,
      ${({ $result }) => RESULT_COLORS[$result]} 9%,
      rgba(255, 255, 255, 0.6)
    );

    &:hover,
    &:focus-visible {
      background: color-mix(
        in srgb,
        ${({ $result }) => RESULT_COLORS[$result]} 15%,
        rgba(255, 255, 255, 0.8)
      );
    }
  }

  @media (max-width: 1100px) {
    grid-template-columns: ${COLUMNS_MID};
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 4.5rem minmax(0, 1fr) 1.25rem;
    grid-template-areas:
      'result opponent open'
      'result meta open';
    gap: 0.25rem 0.75rem;
    padding: 0.7rem 0.8rem;
  }
`

const Cell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
`

const OpponentCell = styled(Cell)`
  @media (max-width: 768px) {
    grid-area: opponent;
  }
`

const Ellipsis = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Secondary = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  font-size: 0.78rem;
  opacity: 0.72;
`

const Rating = styled.span`
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.72;
  font-variant-numeric: tabular-nums;
`

// The opponent's line is the bold one; the viewed player's is muted.
const PlayerLine = styled.span<{ $isPlayer: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  font-size: ${({ $isPlayer }) => ($isPlayer ? '0.85rem' : '0.95rem')};
  font-weight: ${({ $isPlayer }) => ($isPlayer ? 400 : 600)};

  & > :not(${SideDot}) {
    opacity: ${({ $isPlayer }) => ($isPlayer ? 0.72 : 1)};
  }
`

const DesktopCell = styled(Cell)`
  @media (max-width: 768px) {
    display: none;
  }
`

const Numeric = styled(DesktopCell)`
  font-variant-numeric: tabular-nums;
`

// Phones fold reason, time control, moves and time into one line.
const MobileMeta = styled(Secondary)`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    grid-area: meta;
  }
`

const OpenIcon = styled(FiExternalLink)`
  opacity: 0.35;
  justify-self: end;

  /* && outranks the global "* { transition: ... !important }" theme rule,
     which would otherwise drop the transform transition. */
  && {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease !important;
  }

  /* Nudge toward where the arrow points: this opens the game off-site. */
  ${GameRow}:hover &,
  ${GameRow}:focus-visible & {
    opacity: 0.9;
    transform: translate(2px, -2px);
  }

  @media (max-width: 768px) {
    grid-area: open;
  }
`

const EmptyFilter = styled.p`
  margin: 0;
  padding: 2rem 1rem;
  text-align: center;
  opacity: 0.6;
`

// ─── InputGames styled components ─────────────────────────────────────────────

const SelectMonthPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-height: 100vh;
`

const SelectMonthHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
`

const SelectMonthTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: #fff;

  [data-mantine-color-scheme='light'] & {
    color: #0f172a;
  }
`

const SelectMonthSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  max-width: 36rem;
  line-height: 1.6;

  [data-mantine-color-scheme='light'] & {
    color: rgba(0, 0, 0, 0.5);
  }
`

const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--brand-ring);
  background: rgb(0, 0, 0, 0.2);
  width: 100%;
  max-width: 36rem;

  [data-mantine-color-scheme='light'] & {
    background: rgb(255, 255, 255, 0.3);
  }
`

const ProfileAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--brand-border-soft);
`

const ProfileAvatarPlaceholder = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--brand-fill);
  border: 2px solid var(--brand-border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`

const ProfileName = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  [data-mantine-color-scheme='light'] & {
    color: #0f172a;
  }
`

const ProfileHandle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);

  [data-mantine-color-scheme='light'] & {
    color: rgba(0, 0, 0, 0.45);
  }
`

const ProfileCountry = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-left: auto;

  [data-mantine-color-scheme='light'] & {
    color: rgba(0, 0, 0, 0.55);
  }
`

const PickerCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 1.5rem;
  width: 100%;
  margin: 0.05rem;
  max-width: 36rem;
  background: rgb(0, 0, 0, 0.2);
  border: 1px solid transparent;
  background-clip: padding-box;
  box-shadow:
    0 0 0 1px var(--brand-ring),
    0 0 40px var(--brand-ring-faint),
    0 8px 32px rgba(0, 0, 0, 0.4);

  [data-mantine-color-scheme='light'] & {
    background: rgb(255, 255, 255, 0.3);
    box-shadow:
      0 0 0 1px var(--brand-ring),
      0 8px 32px rgba(0, 0, 0, 0.1);
  }
`

const YearNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`

const YearNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  [data-mantine-color-scheme='light'] & {
    border-color: rgba(0, 0, 0, 0.12);
    background: rgba(0, 0, 0, 0.04);
    color: rgba(0, 0, 0, 0.6);

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.08);
      color: #000;
    }
  }
`

const YearDisplay = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  min-width: 5rem;
  text-align: center;

  [data-mantine-color-scheme='light'] & {
    color: #0f172a;
  }
`

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
`

const MonthButton = styled.button<{ $selected: boolean; $disabled: boolean }>`
  padding: 0.65rem 0;
  border-radius: 0.6rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.15s;
  border: 1px solid
    ${(props) =>
      props.$selected ? 'var(--brand-border)' : 'rgba(255, 255, 255, 0.08)'};
  background: ${(props) =>
    props.$selected ? 'var(--brand-fill)' : 'rgba(255, 255, 255, 0.04)'};
  color: ${(props) => {
    if (props.$disabled) return 'rgba(255, 255, 255, 0.2)'
    if (props.$selected) return '#fff'
    return 'rgba(255, 255, 255, 0.75)'
  }};
  box-shadow: ${(props) =>
    props.$selected ? '0 0 16px var(--brand-glow)' : 'none'};

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$selected ? 'var(--brand-fill)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${(props) =>
      props.$selected ? 'var(--brand-border)' : 'rgba(255, 255, 255, 0.2)'};
    color: #fff;
  }

  [data-mantine-color-scheme='light'] & {
    border-color: ${(props) =>
      props.$selected ? 'var(--brand-border)' : 'rgba(0, 0, 0, 0.1)'};
    background: ${(props) =>
      props.$selected ? 'var(--brand-fill)' : 'rgba(0, 0, 0, 0.03)'};
    color: ${(props) => {
      if (props.$disabled) return 'rgba(0, 0, 0, 0.2)'
      if (props.$selected) return '#fff'
      return 'rgba(0, 0, 0, 0.7)'
    }};
    &:hover:not(:disabled) {
      background: ${(props) =>
        props.$selected ? 'var(--brand-fill)' : 'rgba(0, 0, 0, 0.1)'};
      border-color: ${(props) =>
        props.$selected ? 'var(--brand-border)' : 'rgba(0, 0, 0, 0.2)'};
      color: #111;
    }
  }
`

const FooterNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);

  [data-mantine-color-scheme='light'] & {
    color: rgba(0, 0, 0, 0.35);
  }
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface StandardGame {
  BlackElo: string
  PlayerELO: string
  Result: string
  TimeControl: string
  WhiteElo: string
  blackPlayer: string
  date_time: string
  gameEndDate: string | null
  moveCount: number
  resultForPlayer: string
  time_class: string
  url: string
  whitePlayer: string
  Termination: string
  opening?: string | null
}

interface LocationState {
  games?: Array<StandardGame>
}

// ─── Component ────────────────────────────────────────────────────────────────

function Games() {
  const navigate = useNavigate()
  const { username } = useParams({ from: '/games/$username' })
  const location = useLocation()
  const stateGames = (location.state as LocationState).games
  const search = useSearch({ from: '/games/$username' })

  const platform = usePlatform()
  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useProfile(username, platform)

  if (isFetchingProfile) return <Spinner />

  if (errorProfile) {
    return (
      <ErrorContainer>
        <h1>Error</h1>
        <p>Could not load game data. Please try again.</p>
      </ErrorContainer>
    )
  }

  function onSubmit(month: string) {
    const [year, inputmonth] = month.split('-')
    navigate({
      to: '/dashboard/$username',
      params: { username },
      search: {
        year,
        month: inputmonth,
        range: '30D',
        ...platformSearch(platform),
      },
    })
  }

  function InputGames() {
    const joinedDate = profile?.joined
      ? dayjs.unix(profile.joined)
      : dayjs('2007-01-01')
    const minYear = joinedDate.year()
    const minMonth = joinedDate.month() // 0-indexed
    const maxYear = dayjs().year()
    const maxMonth = dayjs().month() // 0-indexed

    // chess.com only; undefined (still loading, or lichess) falls back to
    // the joined-date range alone.
    const archiveMonths = useArchiveMonths(username, platform)
    // Until the user steps through years, open on the latest year that has
    // games, not a current year the player may not have played in.
    const latestArchiveYear = archiveMonths?.size
      ? Math.max(...[...archiveMonths].map((key) => Number(key.slice(0, 4))))
      : null
    const [pickedYear, setPickedYear] = useState<number | null>(null)
    const year = pickedYear ?? latestArchiveYear ?? maxYear
    const setYear = (step: number) => setPickedYear(year + step)

    const isMonthDisabled = (monthIdx: number) => {
      if (year < minYear) return true
      if (year === minYear && monthIdx < minMonth) return true
      if (year > maxYear) return true
      if (year === maxYear && monthIdx > maxMonth) return true
      if (archiveMonths) {
        const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`
        return !archiveMonths.has(key)
      }
      return false
    }

    // One click: picking a month opens it.
    const openMonth = (monthIdx: number) => {
      const monthStr = String(monthIdx + 1).padStart(2, '0')
      onSubmit(`${year}-${monthStr}`)
    }

    return (
      <SelectMonthPage>
        <SelectMonthHeader>
          <SelectMonthTitle>Select a month to analyze</SelectMonthTitle>
          <SelectMonthSubtitle>
            Explore and analyze every game played in a specific month. Dive into
            performance, opponents and key insights.
          </SelectMonthSubtitle>
        </SelectMonthHeader>

        <ProfileCard>
          {profile?.avatar ? (
            <ProfileAvatar
              src={profile.avatar}
              alt={profile.name || username}
            />
          ) : (
            <ProfileAvatarPlaceholder>
              {username[0].toUpperCase()}
            </ProfileAvatarPlaceholder>
          )}
          <ProfileInfo>
            <ProfileName>
              {profile?.title && (
                <TitleBadge
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                  }}
                >
                  {profile.title}
                </TitleBadge>
              )}
              {profile?.name || username}
            </ProfileName>
            <ProfileHandle>
              {/* Without a real name the handle is already the title. */}
              {profile?.name && `@${profile.username}`}
              <PlatformBadge platform={platform} />
            </ProfileHandle>
          </ProfileInfo>
          {profile?.country && (
            <ProfileCountry>
              {profile.country.code !== 'XX' && (
                <img
                  src={`https://flagsapi.com/${profile.country.code}/flat/32.png`}
                  alt=""
                />
              )}
              {profile.country.name}
            </ProfileCountry>
          )}
        </ProfileCard>

        <PickerCard>
          <YearNav>
            <YearNavButton
              aria-label="Previous year"
              onClick={() => setYear(-1)}
              disabled={year <= minYear}
            >
              <FaChevronLeft size={14} />
            </YearNavButton>
            <YearDisplay>{year}</YearDisplay>
            <YearNavButton
              aria-label="Next year"
              onClick={() => setYear(1)}
              disabled={year >= maxYear}
            >
              <FaChevronRight size={14} />
            </YearNavButton>
          </YearNav>

          <MonthGrid>
            {MONTHS.map((label, idx) => {
              const disabled = isMonthDisabled(idx)
              return (
                <MonthButton
                  key={label}
                  $selected={false}
                  $disabled={disabled}
                  disabled={disabled}
                  title={disabled ? 'No games this month' : undefined}
                  onClick={() => openMonth(idx)}
                >
                  {label}
                </MonthButton>
              )
            })}
          </MonthGrid>

          <FooterNote>
            <FaShieldAlt size={12} />
            Pick a month to open its games. Only completed games are included.
          </FooterNote>
        </PickerCard>
      </SelectMonthPage>
    )
  }

  if (!username || !search.year || !search.month || !search.day) {
    return <InputGames />
  }

  const dayKey = `${search.year}.${search.month}.${search.day}`
  const playerName = profile?.name || profile?.username || username

  // Opened from the chart: the day's games came along in router state, so
  // show them straight away. Otherwise (reload, shared link) load them.
  if (stateGames?.length && stateGames[0].gameEndDate === dayKey) {
    return (
      <GameList
        games={stateGames}
        username={username}
        playerName={playerName}
        platform={platform}
      />
    )
  }

  return (
    <DayGames
      username={username}
      year={search.year}
      month={search.month}
      dayKey={dayKey}
      playerName={playerName}
      platform={platform}
    />
  )
}

// Loads the month's archive and keeps the requested day's games.
function DayGames({
  username,
  year,
  month,
  dayKey,
  playerName,
  platform,
}: {
  username: string
  year: string
  month: string
  dayKey: string
  playerName: string
  platform: ReturnType<typeof usePlatform>
}) {
  const { games, isPending, error } = useGames(username, year, month, platform)
  const { transformedData, progress } = useProgressiveTransform(
    games,
    username,
    platform,
  )

  if (error) {
    return (
      <ErrorContainer>
        <h1>Error</h1>
        <p>{error.message}</p>
      </ErrorContainer>
    )
  }
  if (isPending || progress < 100) return <Spinner />

  const dayGames = transformedData.standardgamesData.filter(
    (game) => game.gameEndDate === dayKey,
  )

  if (dayGames.length === 0) {
    return (
      <ErrorContainer>
        <h1>No games</h1>
        <p>{playerName} has no finished games on this day.</p>
      </ErrorContainer>
    )
  }

  return (
    <GameList
      games={dayGames}
      username={username}
      playerName={playerName}
      platform={platform}
    />
  )
}

type Filter = 'all' | Result

function GameList({
  games,
  username,
  playerName,
  platform,
}: {
  games: Array<StandardGame>
  username: string
  playerName: string
  platform: ReturnType<typeof usePlatform>
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const router = useRouter()

  const counts: Record<Result, number> = { win: 0, loss: 0, draw: 0 }
  for (const game of games) counts[game.resultForPlayer as Result]++
  const points = counts.win + counts.draw / 2

  // Every game here is from the one day that was clicked on the chart.
  const day = games[0]?.gameEndDate
    ? parseDayKey(games[0].gameEndDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const shown =
    filter === 'all'
      ? games
      : games.filter((game) => game.resultForPlayer === filter)

  const lowerUsername = username.toLowerCase()
  const filters: Array<{ key: Filter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: games.length },
    { key: 'win', label: 'Wins', count: counts.win },
    { key: 'loss', label: 'Losses', count: counts.loss },
    { key: 'draw', label: 'Draws', count: counts.draw },
  ]

  return (
    <PageContainer>
      <BackLink>
        <Link
          to="/dashboard/$username"
          params={{ username }}
          search={{
            range: '90D',
            year: undefined,
            month: undefined,
            ...platformSearch(platform),
          }}
          onClick={(event) => {
            // Return to the dashboard exactly as it was left (its range,
            // tab and scroll); the link is the fallback for direct visits.
            if (window.history.length > 1 && !event.metaKey && !event.ctrlKey) {
              event.preventDefault()
              router.history.back()
            }
          }}
        >
          <FiArrowLeft size={14} /> Back to dashboard
        </Link>
      </BackLink>

      <Header>
        <HeaderText>
          <PageTitle>Match history</PageTitle>
          <PageSubtitle>
            <SubtitleItem>
              <SubtitleIcon $accent="#ec4899">
                <FaChessKing size={12} aria-hidden />
              </SubtitleIcon>
              <span>{playerName}</span>
            </SubtitleItem>
            <span>·</span>
            <SubtitleItem>
              <SubtitleIcon $accent="#38bdf8">
                <FaCalendarDay size={11} aria-hidden />
              </SubtitleIcon>
              <span>{day}</span>
            </SubtitleItem>
          </PageSubtitle>
        </HeaderText>
        <Summary>
          <SummaryItem>
            <SummaryIcon $accent="#5fd2e6">
              <FaGamepad size={17} aria-hidden />
            </SummaryIcon>
            <SummaryText>
              <SummaryLabel>Games</SummaryLabel>
              <SummaryValue>{games.length}</SummaryValue>
            </SummaryText>
          </SummaryItem>
          <SummaryItem>
            <SummaryIcon $accent="#f59e0b">
              <SiTarget size={16} aria-hidden />
            </SummaryIcon>
            <SummaryText>
              <SummaryLabel>Score</SummaryLabel>
              <SummaryValue>
                {points}
                <span style={{ opacity: 0.5, fontWeight: 500 }}>
                  {' '}
                  / {games.length}
                </span>
              </SummaryValue>
            </SummaryText>
          </SummaryItem>
          <SummaryItem>
            <SummaryIcon $accent="#a855f7">
              <FaChartPie size={15} aria-hidden />
            </SummaryIcon>
            <SummaryText>
              <SummaryLabel>W · L · D</SummaryLabel>
              <SummaryValue>
                <span style={{ color: RESULT_COLORS.win }}>{counts.win}</span>
                <span style={{ opacity: 0.4 }}> · </span>
                <span style={{ color: RESULT_COLORS.loss }}>{counts.loss}</span>
                <span style={{ opacity: 0.4 }}> · </span>
                <span style={{ color: RESULT_COLORS.draw }}>{counts.draw}</span>
              </SummaryValue>
            </SummaryText>
          </SummaryItem>
        </Summary>
      </Header>

      <Filters role="group" aria-label="Filter by result">
        {filters.map(({ key, label, count }) => (
          <FilterChip
            key={key}
            type="button"
            $active={filter === key}
            $color={key === 'all' ? undefined : RESULT_COLORS[key]}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {label} <ChipCount>{count}</ChipCount>
          </FilterChip>
        ))}
      </Filters>

      <Panel>
        <TableHeader>
          <span>Result</span>
          <span>Players</span>
          <span>How it ended</span>
          <span>Time</span>
          <span>Moves</span>
          <span>Ended</span>
          <span />
        </TableHeader>
        <GamesList>
          {shown.length === 0 && (
            <EmptyFilter>
              No {filter === 'loss' ? 'losses' : `${filter}s`} on this day.
            </EmptyFilter>
          )}
          {shown.map((game) => {
            const result = game.resultForPlayer as Result
            const isWhite = game.whitePlayer.toLowerCase() === lowerUsername
            const opponent = isWhite ? game.blackPlayer : game.whitePlayer
            const reason = shortTermination(game.Termination)
            const timeControl = formatTimeControl(game.TimeControl)
            const endedAt = game.date_time.split(' ')[1]?.slice(0, 5) ?? ''

            return (
              <GameRow
                key={game.url}
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                $result={result}
                aria-label={`${RESULT_LABELS[result]} against ${opponent}, ${reason.toLowerCase()}, ${game.moveCount} moves. Opens on ${platform === 'lichess' ? 'Lichess' : 'Chess.com'}.`}
              >
                <RowResultPill $result={result}>
                  <span>
                    <ResultIcon result={result} />
                    {RESULT_LABELS[result]}
                  </span>
                  <small>{game.Result}</small>
                </RowResultPill>

                <OpponentCell>
                  {/* Same order on every row: opponent (bold) first, then
                      the viewed player (muted). The dot shows who had
                      White; the result colour doesn't depend on it. */}
                  {(
                    [
                      {
                        isPlayer: false,
                        side: isWhite ? 'black' : 'white',
                        name: opponent,
                        rating: isWhite ? game.BlackElo : game.WhiteElo,
                      },
                      {
                        isPlayer: true,
                        side: isWhite ? 'white' : 'black',
                        name: isWhite ? game.whitePlayer : game.blackPlayer,
                        rating: isWhite ? game.WhiteElo : game.BlackElo,
                      },
                    ] as const
                  ).map(({ isPlayer, side, name, rating }) => (
                    <PlayerLine key={side} $isPlayer={isPlayer}>
                      <SideDot
                        $side={side}
                        title={side === 'white' ? 'White' : 'Black'}
                      />
                      <Ellipsis>{name}</Ellipsis>
                      <Rating>{rating}</Rating>
                    </PlayerLine>
                  ))}
                </OpponentCell>

                <DesktopCell>
                  <Ellipsis>{reason}</Ellipsis>
                  {game.opening && (
                    <Secondary>
                      <Ellipsis title={game.opening}>{game.opening}</Ellipsis>
                    </Secondary>
                  )}
                </DesktopCell>

                <Numeric>
                  <span>{timeControl}</span>
                  <Secondary style={{ textTransform: 'capitalize' }}>
                    {game.time_class}
                  </Secondary>
                </Numeric>
                <Numeric>{game.moveCount}</Numeric>
                <Numeric>{endedAt}</Numeric>

                <MobileMeta>
                  {/* Time first: if the line is cut short, the move count
                      goes, not the time. */}
                  <Ellipsis>
                    {endedAt} · {reason} · {timeControl} · {game.moveCount}{' '}
                    moves
                  </Ellipsis>
                </MobileMeta>

                <OpenIcon size={15} aria-hidden />
              </GameRow>
            )
          })}
        </GamesList>
      </Panel>
    </PageContainer>
  )
}

export default Games
