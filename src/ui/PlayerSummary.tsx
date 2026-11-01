// A few sentences about the player above their peak ratings, written by an
// LLM from facts about their recent games. Loads on its own and hides
// itself when there's nothing to say or it can't be fetched.
import styled from 'styled-components'
import usePlayerSummary from '../hooks/usePlayerSummary'
import { Pulse } from './DashboardSkeleton'
import type { Platform } from '../helpers/platform'

const Summary = styled.p`
  margin: 0;
  max-width: 62rem;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.85;
`

const Skeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`

function PlayerSummary({
  username,
  platform,
}: {
  username: string
  platform: Platform
}) {
  const { summary, isPending, error } = usePlayerSummary(username, platform)

  if (isPending) {
    return (
      <Skeleton aria-busy="true" aria-label="Loading summary">
        <Pulse $w="92%" $h="0.95rem" />
        <Pulse $w="70%" $h="0.95rem" />
      </Skeleton>
    )
  }
  if (error || !summary) return null

  return <Summary>{summary}</Summary>
}

export default PlayerSummary
