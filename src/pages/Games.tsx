import styled from 'styled-components'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { MonthPicker } from '@mantine/dates'
import { FaArrowLeftLong } from 'react-icons/fa6'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { formatDate, queryFormatDate } from '../helpers/DateFormat'
import Button from '../ui/Button'
import '@mantine/dates/styles.css'

const Title = styled.div`
  font-size: 1.5rem;
  font-wieght: 500;
  padding-left: 0.75rem;
`
const StyledContainer = styled.div`
  display: grid;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`
const StyledCalendar = styled.div`
  display: flex;
  // min-width: 50rem;
  flex-direction: column;
  // align-items: center;
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
const TitleContainer = styled.div`
  display: flex;
  align-content: center;
  justify-content: space-between;
  align-items: center;
  width: 69rem;
  height: 5rem;
`
const StyledGamesHeader = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.5fr 1.3fr 1fr 1fr;
  width: 100%;
  background-color: var(--mantine-color-dark-9);
  max-width: 69rem;
  border-radius: 1rem 1rem 0rem 0rem;
  font-size: 1.3rem;
  font-color: var(--mantine-color-text)
  align-items: center;
  align-content: center;
  padding-left: 1rem;
  height: 3rem;
  border: 2px solid var(--mantine-color-gray-5);
`
const StyledGamesList = styled.div`
  width: 69rem;
  display: flex;
  height: 55vh;
  flex-direction: column;
  border-radius: 0rem 0rem 1rem 1rem;
  overflow-y: auto;
  border: 2px solid var(--mantine-color-gray-5);
  border-top: none;
`
const StyledGameCard = styled.div<{ result: 'win' | 'loss' | 'draw' }>`
  display: grid;
  grid-template-columns: 1.3fr 0.5fr 1.3fr 1fr 1fr;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: ${(props) => {
    if (props.result === 'win') return 'rgba(92, 184, 92, 0.15)'
    if (props.result === 'loss') return 'rgba(217, 83, 79, 0.15)'
    return 'rgba(255, 255, 255, 0.05)'
  }};
  border-bottom: 1.5px solid
    ${(props) => {
      if (props.result === 'win') return 'rgba(92, 184, 92, 0.3)'
      if (props.result === 'loss') return 'rgba(217, 83, 79, 0.3)'
      return 'rgba(255, 255, 255, 0.05)'
    }};
  // border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s !important;
  align-items: center;

  &:hover {
    background: ${(props) => {
      if (props.result === 'win') return 'rgba(92, 184, 92, 0.25)'
      if (props.result === 'loss') return 'rgba(217, 83, 79, 0.25)'
      return 'rgba(240, 173, 78, 0.25)'
    }};
    border-color: ${(props) => {
      if (props.result === 'win') return 'rgba(92, 184, 92, 0.6)'
      if (props.result === 'loss') return 'rgba(217, 83, 79, 0.6)'
      return 'rgba(240, 173, 78, 0.6)'
    }};
    transform: translateY(-4px);
  }
  &:last-child {
  }
`
const PlayersColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
const PlayerRow = styled.div<{ $isWinner?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.$isWinner ? '#fff' : 'rgba(255, 255, 255, 0.6)')};
  font-weight: ${(props) => (props.$isWinner ? '600' : '400')};
  font-size: 1.24rem;
`
const ColorIndicator = styled.div<{ color: 'white' | 'black' }>`
  width: 15px;
  height: 15px;
  border-radius: 3px;
  background: ${(props) => (props.color === 'white' ? '#fff' : '#111')};
  border: ${(props) =>
    props.color === 'white'
      ? '1px solid rgba(0, 0, 0, 0.5)'
      : '1px solid rgba(255, 255, 255, 0.5)'};
  flex-shrink: 0;
`
const ResultBadge = styled.div<{ result: 'win' | 'loss' | 'draw' }>`
  display: flex;
  align-items: center;
  // gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${(props) => {
    if (props.result === 'win') return '#5cb85c'
    if (props.result === 'loss') return '#d9534f'
    return '#f0ad4e'
  }};
`
const Stat = styled.div`
  padding-left: 4rem;
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`
const DateText = styled.div`
  font-size: 1.12rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
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
  const { year: yearsearch, month: monthsearch } = useSearch({
    from: '/games/$username',
  })
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
      search: { year: year, month: inputmonth },
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

  function handleBackNavigation() {
    navigate({
      to: '/dashboard/$username',
      params: { username },
      search: { year: yearsearch, month: monthsearch },
    })
  }

  const gameDate = games[0]?.gameEndDate || ''
  return (
    <StyledContainer>
      <TitleContainer>
        <Button onClick={() => handleBackNavigation()}>
          <FaArrowLeftLong />
        </Button>
        <Title style={{ fontSize: '32px', paddingRight: '12rem' }}>
          {`Games for ${profile?.name} on ${queryFormatDate(gameDate).entireDate}`}
        </Title>
      </TitleContainer>
      <StyledGamesHeader>
        <span>Players</span>
        <span>Result</span>
        <span>Termination</span>
        <span>Number of Moves</span>
        <span>Date</span>
      </StyledGamesHeader>
      <StyledGamesList>
        {games.map((game) => (
          <a key={game.url} href={game.url} target="_blank">
            <StyledGameCard
              // key={game.date_time}
              result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
            >
              <PlayersColumn>
                <PlayerRow
                  $isWinner={
                    game.whitePlayer === username &&
                    game.resultForPlayer === 'win'
                  }
                >
                  <ColorIndicator color="white" />
                  <span>{game.whitePlayer}</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    ({game.WhiteElo})
                  </span>
                </PlayerRow>
                <PlayerRow
                  $isWinner={
                    game.blackPlayer === username &&
                    game.resultForPlayer === 'win'
                  }
                >
                  <ColorIndicator color="black" />
                  <span>{game.blackPlayer}</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    ({game.BlackElo})
                  </span>
                </PlayerRow>
              </PlayersColumn>
              <ResultBadge
                result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
              >
                {game.Result}
              </ResultBadge>
              <ResultBadge
                result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
              >
                {game.Termination}
              </ResultBadge>
              <Stat>
                <span>{game.moveCount}</span>
              </Stat>
              <DateText>
                <span>{game.date_time}</span>
              </DateText>
            </StyledGameCard>
          </a>
        ))}
      </StyledGamesList>
    </StyledContainer>
  )
}

export default Games
