import styled from 'styled-components'
import { FaStopwatch, FaSun } from 'react-icons/fa'
import { SiStackblitz } from 'react-icons/si'
import { GiBulletBill } from 'react-icons/gi'
import { useParams } from '@tanstack/react-router'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import useGames30days from '../hooks/useGames30days'
import { transformGames } from '../helpers/TransformGames'
import { gamesDateWise } from '../helpers/gamesDateWise'
import AreaGraph from '../ui/AreaGraph'

const StyledContainer = styled.div`
  display: grid;
  grid-gap: 0.25rem;
  align-items: ceter;
  min-width: 83rem;
  justify-items: center;
  justify-content: center;
`

export const TitleMain = styled.h2`
  font-size: 42px;
  text-align: center;
  font-weight: 700;
`
const Title = styled.h2`
  font-size: 28px;
  text-align: center;
  font-weight: 500;
`
const TitleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 12rem;
`
const StyledGames = styled.div`
  display: grid;
  gap: 0.2rem;
  align-items: center;
  min-width: 69rem;
  height: fit-content;
  border: 1.5px solid #666;
  border-radius: 20px;
  font-size: 22px;
  padding: 3rem;
  justify-items: center;
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
  const graphdataBlitz = gamesDateWise(transformedData.blitzGames)
  const graphdataRapid = gamesDateWise(transformedData.rapidGames)
  const graphdataBullet = gamesDateWise(transformedData.bulletGames)
  const graphdataDaily = gamesDateWise(transformedData.dailyGames)

  console.log(graphdataBlitz)

  const timeControls = [
    { key: graphdataBlitz, label: 'Blitz', icon: <SiStackblitz size={35} /> },
    {
      key: graphdataBullet,
      label: 'Bullet',
      icon: <GiBulletBill size={35} />,
    },
    { key: graphdataRapid, label: 'Rapid', icon: <FaStopwatch size={35} /> },
    { key: graphdataDaily, label: 'Daily', icon: <FaSun size={35} /> },
  ] as const

  return (
    <StyledContainer>
      <TitleMain>{`Games of ${playerName}`}</TitleMain>
      {timeControls.map(({ key, label, icon }) => {
        return (
          <StyledGames key={label}>
            <TitleBadge>
              {icon}
              <Title>{`${label} Graph`}</Title>
            </TitleBadge>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <AreaGraph data={key} />
            </div>
          </StyledGames>
        )
      })}
    </StyledContainer>
  )
}

export default DashBoard
