import styled from 'styled-components'
import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { MonthPicker } from '@mantine/dates'
import { SiTarget } from 'react-icons/si'
import { FaChevronRight } from 'react-icons/fa6'
import { GiTrophy } from 'react-icons/gi'
import {
  FaCalendarDay,
  FaChessKing,
  FaHandshake,
  FaHeartBroken,
} from 'react-icons/fa'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { formatDate, queryFormatDate } from '../helpers/DateFormat'
import Button from '../ui/Button'
import '@mantine/dates/styles.css'

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

// Keep your existing styled components for the month picker...
const StyledContainer = styled.div`
  display: grid;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`

const StyledCalendar = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
`

const StyledInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  border-radius: 2rem;
  padding: 2rem;
  width: fit-content;
  background-color: var(--mantine-color-dark-6);
`
const IconRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 0.5rem;
`

const TitleContainer = styled.div`
  display: flex;
  align-content: center;
  justify-content: space-between;
  align-items: center;
  width: 69rem;
  height: 5rem;
`

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  padding-left: 0.75rem;
`

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

function Games() {
  const navigate = useNavigate()
  const { username } = useParams({ from: '/games/$username' })
  const location = useLocation()
  const games = (location.state as LocationState).games

  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useProfile(username)

  const mindate = formatDate(profile?.joined).formattedDate

  if (isFetchingProfile) return <Spinner />

  if (errorProfile) {
    return (
      <StyledContainer>
        <h1>Error</h1>
        <p>Could not load game data. Please try again.</p>
      </StyledContainer>
    )
  }

  function onSubmit(month: string) {
    const DashBoardInput = month.split('-')
    const year = DashBoardInput[0]
    const inputmonth = DashBoardInput[1]

    navigate({
      to: '/dashboard/$username',
      params: { username },
      search: { year: year, month: inputmonth, range: '30D' },
    })
  }

  function InputGames() {
    const [month, setMonth] = useState<string | null>(null)

    if (isFetchingProfile) return <Spinner />

    if (errorProfile) {
      return (
        <StyledContainer>
          <h1>Error</h1>
          <p>Could not load game data. Please try again.</p>
        </StyledContainer>
      )
    }
    return (
      <StyledCalendar>
        <TitleContainer>
          <Title>Which month are we diving into for game analysis?</Title>
        </TitleContainer>
        <StyledInput>
          <MonthPicker
            allowDeselect
            minDate={mindate}
            maxDate={dayjs().format('YYYY-MM-DD')}
            value={month}
            onChange={setMonth}
            defaultValue={dayjs().format('DD-MM-YY')}
            size="md"
          />
          <Button
            disabled={month === null}
            onClick={() => {
              if (month) onSubmit(month)
            }}
          >
            Submit
          </Button>
        </StyledInput>
      </StyledCalendar>
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
  console.log(games)

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
            // const userRating = isUserWhite ? game.WhiteElo : game.BlackElo
            // const opponentRating = isUserWhite ? game.BlackElo : game.WhiteElo

            return (
              <GameCard
                key={game.url}
                href={game.url}
                target="_blank"
                $result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
              >
                {/* Players */}
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

                {/* Result */}
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

                {/* Termination */}
                <InfoText>{game.Termination}</InfoText>

                {/* Moves */}
                <MovesCount>{game.moveCount}</MovesCount>

                {/* Date */}
                <DateSection>
                  <div>{game.date_time.split(' ')[0]}</div>
                  <div>{game.date_time.split(' ')[1]}</div>
                </DateSection>

                {/* Chevron */}
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
