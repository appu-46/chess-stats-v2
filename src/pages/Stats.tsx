import styled from 'styled-components'
import { FaMedal } from 'react-icons/fa'
import { LuRefreshCw } from 'react-icons/lu'
import { useParams } from '@tanstack/react-router'
import useStats from '../hooks/useStats'
import Spinner from '../ui/Spinner'
import { RecordPercentageCalc } from '../helpers/RecordPercentageCalc'
import PieGraph from '../ui/PieGraph'
import StatsBlock from '../ui/StatsBlock'

const StyledStats = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  align-items: center;
  max-width: 120rem;
  justify-content: center;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
`
const Title = styled.h2`
  font-size: 22px;
  color: ##233b46;
`

function Stats() {
  const { username } = useParams({ from: '/stats/$username' })
  const { data: stats, isPending: isFetchingStats } = useStats(username)

  console.log(stats)
  const {
    chess960_daily = null,
    chess_blitz = null,
    chess_bullet = null,
    chess_daily = null,
    chess_rapid = null,
    puzzle_rush = null,
    tactics = null,
    fide = null,
  } = stats ?? {}

  console.log(
    chess960_daily,
    chess_blitz,
    chess_bullet,
    chess_daily,
    chess_rapid,
    puzzle_rush,
    tactics,
    fide,
  )

  if (isFetchingStats) return <Spinner size="large" />

  const recordBlitz = chess_blitz?.record
    ? RecordPercentageCalc(chess_blitz.record)
    : null
  const recordBullet = chess_bullet?.record
    ? RecordPercentageCalc(chess_bullet.record)
    : null
  const recordRapid = chess_rapid?.record
    ? RecordPercentageCalc(chess_rapid.record)
    : null
  const recordDaily = chess_daily?.record
    ? RecordPercentageCalc(chess_daily.record)
    : null

  return (
    <StyledStats>
      <StatsBlock>
        <Title>Rapid Rating: </Title>
        <FaMedal />: {chess_rapid?.best?.rating}
        <LuRefreshCw />: {chess_rapid?.last?.rating}
        <div style={{ width: '350px', height: '250px' }}>
          <PieGraph record={recordRapid} />
        </div>
      </StatsBlock>
      <StatsBlock>
        <Title>Blitz Rating: </Title>
        <FaMedal />: {chess_blitz?.best?.rating}
        <LuRefreshCw />: {chess_blitz?.last?.rating}
        <div style={{ width: '350px', height: '250px' }}>
          <PieGraph record={recordBlitz} />
        </div>
      </StatsBlock>
      <StatsBlock>
        <Title>Bullet Rating: </Title>
        <FaMedal />: {chess_bullet?.best?.rating}
        <LuRefreshCw />: {chess_bullet?.last?.rating}
        <div style={{ width: '350px', height: '250px' }}>
          <PieGraph record={recordBullet} />
        </div>
      </StatsBlock>
      <StatsBlock>
        <Title>Daily Rating: </Title>
        <FaMedal />: {chess_daily?.best?.rating}
        <LuRefreshCw />: {chess_daily?.last?.rating}
        <div style={{ width: '350px', height: '250px' }}>
          <PieGraph record={recordDaily} />
        </div>
      </StatsBlock>
      <div>Tactics stats: {tactics?.highest?.rating}</div>
      <div style={{ width: '450px', height: '300px', alignItems: 'center' }}>
        <h1>Rapid Records:</h1>
      </div>
      <div style={{ width: '450px', height: '450px' }}>
        <h1>Bullet Records:</h1>
        <PieGraph record={recordBullet} />
      </div>
      <div style={{ width: '450px', height: '450px' }}>
        <h1>Blitz Records:</h1>
        <PieGraph record={recordBlitz} />
      </div>
    </StyledStats>
  )
}

export default Stats
