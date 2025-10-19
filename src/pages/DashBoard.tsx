import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import useProfile from '../hooks/useProfile'
import { transformGames } from '../helpers/TransformGames'
import useGames90days from '../hooks/useGames90days'
import { gamesDateWise } from '../helpers/gamesDateWise'
import AreaGraph from '../ui/AreaGraph'
import Spinner from '../ui/Spinner'
import { StyledContainer } from './Profile'

const StyledGames = styled.div`
  display: grid;
  gap: 0.2rem;
  // grid-template-columns: 7rem auto auto auto auto;
  // grid-template-rows: 5rem 2fr;
  align-items: center;
  width: auto;
  height: fit-content;
  border: 1.5px solid #666;
  border-radius: 20px;
  font-size: 22px;
  padding: 3rem;
  justify-items: start;
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.25rem;
    color: rgba(0, 255, 255, 0.8);
    flex-shrink: 0;
  }
`

interface StandardGame {
  BlackElo: string
  PlayerELO: string
  Result: string
  TimeControl: string
  WhiteElo: string
  blackPlayer: string
  date_time: string
  gameEndDate: string
  moveCount: number
  resultForPlayer: string
  time_class: string
  url: string
  whitePlayer: string
}

interface GroupedGames {
  [date: string]: Array<StandardGame>
}

function DashBoard() {
  const { username } = useParams({ from: '/dashboard/$username' })
  // const searchParams = useSearch({ from: '/games/$username' })

  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useProfile(username)

  const playerName = profile?.name

  // const date = searchParams.date

  const {
    data: games,
    isPending: isFetchingGames,
    error: errorGames,
  } = useGames90days(username)

  if (isFetchingGames || isFetchingProfile) return <Spinner />

  if (errorGames || errorProfile) {
    return (
      <StyledContainer>
        <h1>Error</h1>
        <p>Could not load game data. Please try again.</p>
      </StyledContainer>
    )
  }

  // const result = gamesDateWise(games?.standardgamesData) || {
  //   groupedByDate: {},
  // }
  const transformedData = transformGames(games, username)

  console.log(transformedData)

  const result = gamesDateWise(transformedData?.standardgamesData)

  return (
    <StyledContainer>
      <h1>{`Games for ${playerName}`}</h1>
      <StyledGames>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AreaGraph data={result} />
        </div>
      </StyledGames>
    </StyledContainer>
  )
}

export default DashBoard
