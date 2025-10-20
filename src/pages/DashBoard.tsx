import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import useProfile from '../hooks/useProfile'
import useGames30days from '../hooks/useGames30days'
import { transformGames } from '../helpers/TransformGames'
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

function DashBoard() {
  const { username } = useParams({ from: '/dashboard/$username' })

  const {
    data: profile,
    isPending: isFetchingProfile,
    error: errorProfile,
  } = useProfile(username)
  const {
    data: games,
    isPending: isFetchingGames,
    error: errorGames,
  } = useGames30days(username)

  const playerName = profile?.name

  if (isFetchingGames || isFetchingProfile) return <Spinner />

  if (errorGames || errorProfile) {
    return (
      <StyledContainer>
        <h1>Error</h1>
        <p>Could not load game data. Please try again.</p>
      </StyledContainer>
    )
  }

  const transformedData = transformGames(games, username)
  const result = gamesDateWise(transformedData?.standardgamesData)

  console.log(result)

  return (
    <StyledContainer>
      <h1>{`Games of ${playerName}`}</h1>
      <StyledGames>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AreaGraph data={result} />
        </div>
      </StyledGames>
    </StyledContainer>
  )
}

export default DashBoard
