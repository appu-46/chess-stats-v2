import styled from 'styled-components'
import { useLocation, useParams } from '@tanstack/react-router'
import { Title } from '@mantine/core'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { formatGameDateList, queryFormatDate } from '../helpers/DateFormat'

export const StyledContainer = styled.div`
  display: grid;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`

const StyledGamesHeader = styled.div`
  display: grid;
  margin-top: 1rem;
  align-items: center;
  width: 69rem;
  border-bottom: 3px solid rgba(0, 0, 0, 0.5);
  font-size: 22px;
  grid-template-columns: 1.3fr 0.5fr 1.3fr 1fr 1fr;
  // gap: 1rem;
  border-radius: 1rem 1rem 0rem 0rem;
  padding: 1.25rem 1.5rem;
  justify-items: start;
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 255, 255, 0.5);
    // transform: translateY(-2px);
  }

  svg {
    font-size: 1.25rem;
    color: rgba(0, 255, 255, 0.8);
    flex-shrink: 0;
  }
`
const StyledGamesList = styled.div`
  width: 69rem;
  display: flex;
  flex-direction: column;
  border-radius: 0rem 0rem 1rem 1rem;
`

const StyledGameCard = styled.div<{ result: 'win' | 'loss' | 'draw' }>`
  display: grid;
  grid-template-columns: 1.3fr 0.5fr 1.3fr 1fr 1fr;

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
  transition: all 0.2s;
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

const PlayerRow = styled.div<{ isWinner?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.isWinner ? '#fff' : 'rgba(255, 255, 255, 0.6)')};
  font-weight: ${(props) => (props.isWinner ? '600' : '400')};
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
  const { username } = useParams({ from: '/games/$username' })
  const location = useLocation()
  const games = (location.state as LocationState).games

  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useProfile(username)

  const playerName = profile?.name

  if (isFetchingProfile) return <Spinner />

  if (errorProfile) {
    return (
      <StyledContainer>
        <h1>Error</h1>
        <p>Could not load game data. Please try again.</p>
      </StyledContainer>
    )
  }

  // const selectedDateGames = date ? transformGames[date] : null

  return (
    <StyledContainer>
      <Title>{`Games for ${playerName} on ${queryFormatDate(games?.at(1).gameEndDate)}`}</Title>
      <StyledGamesHeader>
        <span>Players</span>
        <span>Result</span>
        <span>Termination</span>
        <span>Number of Moves</span>
        <span>Date</span>
      </StyledGamesHeader>
      <StyledGamesList>
        {games.map((game) => (
          <a href={game.url} target="_blank">
            <StyledGameCard
              result={game.resultForPlayer as 'win' | 'loss' | 'draw'}
            >
              <PlayersColumn>
                <PlayerRow
                  isWinner={
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
                  isWinner={
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
              <Stat>{game.moveCount}</Stat>
              <DateText>{formatGameDateList(game.date_time)}</DateText>
            </StyledGameCard>
          </a>
        ))}
      </StyledGamesList>
    </StyledContainer>
  )
}

export default Games
