import styled from 'styled-components'
import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'

import { SiTarget } from 'react-icons/si'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import { GiTrophy } from 'react-icons/gi'
import {
  FaCalendarAlt,
  FaCalendarDay,
  FaChartBar,
  FaChessKing,
  FaHandshake,
  FaHeartBroken,
  FaShieldAlt,
} from 'react-icons/fa'
import { useFetchChessprofileFromSupa } from '../hooks/useFetchChessprofileFromSupa'
import Spinner from '../ui/Spinner'
import { queryFormatDate } from '../helpers/DateFormat'
import { TitleBadge } from './Profile'

// ─── Game list styled components ──────────────────────────────────────────────

const PageContainer = styled.div`
  padding: 0.5rem 1rem;
  margin: 0;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 1.5rem;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
`

const PageSubtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  opacity: 0.7;
  margin-top: 0.5rem;
`

const GamesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 72vh;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
  padding-bottom: 2rem;
`

const TableWrapper = styled.div`
  padding: 2rem;
  border-radius: 2rem;
  background: #070c1e;
  box-shadow:
    inset 0 0 20px rgba(255, 255, 255, 0.25),
    0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid #fff7;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    box-shadow:
      inset 0 0 20px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.2);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
  }
`

const TableHeader = styled.div`
  display: grid;
  margin-bottom: 1rem;
  grid-template-columns: 2fr 1fr 1.5fr 0.8fr 1.2fr 0.3fr;
  padding: 0rem 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0;
  }
`

const GameCard = styled.a<{ $result: 'win' | 'loss' | 'draw' }>`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr 0.8fr 1.2fr 0.3fr;
  align-items: center;
  padding: 0.75rem 2rem;
  border-radius: 2rem;
  background: ${(props) => {
    if (props.$result === 'win') return 'rgba(34, 197, 94, 0.2)'
    if (props.$result === 'loss') return 'rgba(239, 68, 68, 0.2)'
    return 'rgba(59, 130, 246, 0.2)'
  }};
  border: 1px solid
    ${(props) => {
      if (props.$result === 'win') return 'rgba(34, 197, 94, 0.35)'
      if (props.$result === 'loss') return 'rgba(239, 68, 68, 0.35)'
      return 'rgba(59, 130, 246, 0.25)'
    }};
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s;

  box-shadow: ${(props) => {
    if (props.$result === 'win')
      return 'inset 0 0 20px rgba(34, 197, 94, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)'
    if (props.$result === 'loss')
      return 'inset 0 0 20px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)'
    return 'inset 0 0 20px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)'
  }};

  &:hover {
    box-shadow: ${(props) => {
      if (props.$result === 'win')
        return 'inset 0 0 30px rgba(34, 197, 94, 0.5), 0 8px 20px rgba(0, 0, 0, 0.3)'
      if (props.$result === 'loss')
        return 'inset 0 0 30px rgba(239, 68, 68, 0.5), 0 8px 20px rgba(0, 0, 0, 0.3)'
      return 'inset 0 0 30px rgba(59, 130, 246, 0.5), 0 8px 20px rgba(0, 0, 0, 0.3)'
    }};
    background: ${(props) => {
      if (props.$result === 'win') return 'rgba(34, 197, 94, 0.4)'
      if (props.$result === 'loss') return 'rgba(239, 68, 68, 0.4)'
      return 'rgba(59, 130, 246, 0.25)'
    }};
    border-color: ${(props) => {
      if (props.$result === 'win') return 'rgba(34, 197, 94, 0.4)'
      if (props.$result === 'loss') return 'rgba(239, 68, 68, 0.4)'
      return 'rgba(59, 130, 246, 0.4)'
    }};
  }
`

const PlayersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const PlayerRow = styled.div<{ $highlight?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: ${(props) => (props.$highlight ? '600' : '400')};
  opacity: ${(props) => (props.$highlight ? '1' : '0.7')};
`

const ColorDot = styled.div<{ $color: 'white' | 'black' }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${(props) => (props.$color === 'white' ? '#fff' : '#1a1a1a')};
  border: 2px solid ${(props) => (props.$color === 'white' ? '#333' : '#666')};

  [data-mantine-color-scheme='light'] & {
    border: 2px solid ${(props) => (props.$color === 'white' ? '#999' : '#333')};
  }
`

const Rating = styled.span`
  font-size: 1rem;
  color: #fff;
  [data-mantine-color-scheme='light'] & {
    color: #333;
  }
`

const PlayerName = styled.span`
  font-size: 1.15rem;
  color: #fff;
  [data-mantine-color-scheme='light'] & {
    color: #333;
  }
`

const ResultSection = styled.div<{ $result: 'win' | 'loss' | 'draw' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const ResultScore = styled.div<{ $result: 'win' | 'loss' | 'draw' }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => {
    if (props.$result === 'win') return '#22c55e'
    if (props.$result === 'loss') return '#ef4444'
    return '#3b82f6'
  }};
`

const ResultLabel = styled.div<{ $result: 'win' | 'loss' | 'draw' }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => {
    if (props.$result === 'win') return '#22c55e'
    if (props.$result === 'loss') return '#ef4444'
    return '#3b82f6'
  }};
`

const InfoText = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`

const MovesCount = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
`

const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 1.15rem;
  opacity: 0.7;
`

const ChevronIcon = styled(FaChevronRight)`
  opacity: 0.5;
  transition: all 0.2s;

  ${GameCard}:hover & {
    opacity: 1;
    transform: translateX(4px);
  }
`

const IconRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 0.5rem;
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
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 36rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
`

const ProfileAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(139, 92, 246, 0.4);
`

const ProfileAvatarPlaceholder = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: 2px solid rgba(139, 92, 246, 0.4);
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
  max-width: 36rem;
  background: #0d1117;
  border: 1px solid transparent;
  background-clip: padding-box;
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.35),
    0 0 40px rgba(99, 102, 241, 0.12),
    0 8px 32px rgba(0, 0, 0, 0.4);

  [data-mantine-color-scheme='light'] & {
    background: #fff;
    box-shadow:
      0 0 0 1px rgba(99, 102, 241, 0.25),
      0 8px 32px rgba(0, 0, 0, 0.1);
  }
`

const PickerCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
`

const PickerCardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;

  [data-mantine-color-scheme='light'] & {
    color: #0f172a;
  }
`

const PickerCardSubtitle = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.45);

  [data-mantine-color-scheme='light'] & {
    color: rgba(0, 0, 0, 0.45);
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
      props.$selected
        ? 'rgba(139, 92, 246, 0.7)'
        : 'rgba(255, 255, 255, 0.08)'};
  background: ${(props) =>
    props.$selected
      ? 'linear-gradient(135deg, #6366f1, #a855f7)'
      : 'rgba(255, 255, 255, 0.04)'};
  color: ${(props) => {
    if (props.$disabled) return 'rgba(255, 255, 255, 0.2)'
    if (props.$selected) return '#fff'
    return 'rgba(255, 255, 255, 0.75)'
  }};
  box-shadow: ${(props) =>
    props.$selected ? '0 0 16px rgba(139, 92, 246, 0.4)' : 'none'};

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$selected
        ? 'linear-gradient(135deg, #6366f1, #a855f7)'
        : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${(props) =>
      props.$selected ? 'rgba(139, 92, 246, 0.7)' : 'rgba(255, 255, 255, 0.2)'};
    color: #fff;
  }

  [data-mantine-color-scheme='light'] & {
    border-color: ${(props) =>
      props.$selected ? 'rgba(99, 102, 241, 0.7)' : 'rgba(0, 0, 0, 0.1)'};
    background: ${(props) =>
      props.$selected
        ? 'linear-gradient(135deg, #6366f1, #a855f7)'
        : 'rgba(0, 0, 0, 0.03)'};
    color: ${(props) => {
      if (props.$disabled) return 'rgba(0, 0, 0, 0.2)'
      if (props.$selected) return '#fff'
      return 'rgba(0, 0, 0, 0.7)'
    }};
  }
`

const AnalyzeButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 0.9rem;
  border-radius: 0.8rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.2s;
  background: ${(props) =>
    props.$disabled
      ? 'rgba(255, 255, 255, 0.08)'
      : 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'};
  color: ${(props) => (props.$disabled ? 'rgba(255, 255, 255, 0.3)' : '#fff')};
  box-shadow: ${(props) =>
    props.$disabled
      ? 'none'
      : '0 4px 24px rgba(139, 92, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)'};

  &:hover:not(:disabled) {
    box-shadow:
      0 6px 32px rgba(139, 92, 246, 0.55),
      0 4px 12px rgba(0, 0, 0, 0.35);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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
}

interface LocationState {
  games?: Array<StandardGame>
}

// ─── Component ────────────────────────────────────────────────────────────────

function Games() {
  const navigate = useNavigate()
  const { username } = useParams({ from: '/games/$username' })
  const location = useLocation()
  const games = (location.state as LocationState).games

  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useFetchChessprofileFromSupa(username)

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
      search: { year, month: inputmonth, range: '30D' },
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

    const [year, setYear] = useState(maxYear)
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

    const isMonthDisabled = (monthIdx: number) => {
      if (year < minYear) return true
      if (year === minYear && monthIdx < minMonth) return true
      if (year > maxYear) return true
      if (year === maxYear && monthIdx > maxMonth) return true
      return false
    }

    const handleSubmit = () => {
      if (selectedMonth === null) return
      const monthStr = String(selectedMonth + 1).padStart(2, '0')
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
            <ProfileHandle>@{username}</ProfileHandle>
          </ProfileInfo>
          {profile?.country && (
            <ProfileCountry>
              <img src={profile?.country_flag_url} />
              {profile?.country?.name}
            </ProfileCountry>
          )}
        </ProfileCard>

        <PickerCard>
          <PickerCardHeader>
            <PickerCardTitle>
              <FaCalendarAlt size={20} color="#6366f1" />
              Choose Month
            </PickerCardTitle>
            <PickerCardSubtitle>
              Pick a month and year to view your game history
            </PickerCardSubtitle>
          </PickerCardHeader>

          <YearNav>
            <YearNavButton
              onClick={() => {
                setYear((y) => y - 1)
                setSelectedMonth(null)
              }}
              disabled={year <= minYear}
            >
              <FaChevronLeft size={14} />
            </YearNavButton>
            <YearDisplay>{year}</YearDisplay>
            <YearNavButton
              onClick={() => {
                setYear((y) => y + 1)
                setSelectedMonth(null)
              }}
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
                  $selected={selectedMonth === idx}
                  $disabled={disabled}
                  disabled={disabled}
                  onClick={() => setSelectedMonth(idx)}
                >
                  {label}
                </MonthButton>
              )
            })}
          </MonthGrid>

          <AnalyzeButton
            $disabled={selectedMonth === null}
            disabled={selectedMonth === null}
            onClick={handleSubmit}
          >
            <FaChartBar size={16} />
            Analyze Games
          </AnalyzeButton>

          <FooterNote>
            <FaShieldAlt size={12} />
            Only completed games are included in the analysis
          </FooterNote>
        </PickerCard>
      </SelectMonthPage>
    )
  }

  if (!username || !games || games.length === 0) {
    return <InputGames />
  }

  const gameDate = games[0]?.gameEndDate || ''

  const getResultIcon = (result: string) => {
    if (result === 'win') return <GiTrophy size={24} color="#22c55e" />
    if (result === 'loss') return <FaHeartBroken size={24} color="#ef4444" />
    return <FaHandshake size={24} color="#3b82f6" />
  }

  const score = games.reduce((acc, game) => {
    if (game.resultForPlayer === 'win') return acc + 1
    if (game.resultForPlayer === 'draw') return acc + 0.5
    return acc
  }, 0)

  return (
    <PageContainer>
      <Header>
        <PageTitle>Match History</PageTitle>
        <PageSubtitle>
          <IconRow>
            <FaCalendarDay size={24} color="aqua" />{' '}
            {queryFormatDate(gameDate).yearMonth}
          </IconRow>
          <span>•</span>
          <IconRow>
            <FaChessKing size={24} color="#ff42c6" /> {profile?.name}
          </IconRow>
          <span>•</span>
          <IconRow>
            <SiTarget size={24} color="crimson" /> {score}/{games.length}
          </IconRow>
        </PageSubtitle>
      </Header>

      <TableWrapper>
        <TableHeader>
          <h2>Player</h2>
          <h2>Score</h2>
          <h2>Result</h2>
          <h2>Moves</h2>
          <h2>Date Time</h2>
        </TableHeader>
        <GamesGrid>
          {games.map((game) => {
            const isUserWhite =
              game.whitePlayer.toLowerCase() === username.toLowerCase()
            const opponentName = isUserWhite
              ? game.blackPlayer
              : game.whitePlayer

            return (
              <GameCard
                key={game.url}
                href={game.url}
                target="_blank"
                $result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
              >
                <PlayersSection>
                  <PlayerRow
                    $highlight={isUserWhite && game.resultForPlayer === 'win'}
                  >
                    <ColorDot $color="white" />
                    <PlayerName>{game.whitePlayer}</PlayerName>
                    <Rating>({game.WhiteElo})</Rating>
                  </PlayerRow>
                  <PlayerRow
                    $highlight={!isUserWhite && game.resultForPlayer === 'win'}
                  >
                    <ColorDot $color="black" />
                    <PlayerName>{game.blackPlayer}</PlayerName>
                    <Rating>({game.BlackElo})</Rating>
                  </PlayerRow>
                </PlayersSection>

                <ResultSection
                  $result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
                >
                  <ResultScore
                    $result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
                  >
                    <IconRow>
                      {getResultIcon(game.resultForPlayer)}
                      {game.Result}
                    </IconRow>
                  </ResultScore>
                  <ResultLabel
                    $result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
                  >
                    {game.resultForPlayer === 'win'
                      ? `${username} Won`
                      : game.resultForPlayer === 'loss'
                        ? `${opponentName} Won`
                        : 'Draw'}
                  </ResultLabel>
                </ResultSection>

                <InfoText>{game.Termination}</InfoText>
                <MovesCount>{game.moveCount}</MovesCount>

                <DateSection>
                  <div>{game.date_time.split(' ')[0]}</div>
                  <div>{game.date_time.split(' ')[1]}</div>
                </DateSection>

                <ChevronIcon />
              </GameCard>
            )
          })}
        </GamesGrid>
      </TableWrapper>
    </PageContainer>
  )
}

export default Games
