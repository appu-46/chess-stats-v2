// The popup a game list opens when a game is picked. The viewer itself
// (the board and chess.js) is only downloaded the first time one opens.
import { Suspense, lazy } from 'react'
import { Modal } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useRouter } from '@tanstack/react-router'
import { gameSearch } from '../helpers/gameLink'
import { brandModalStyles } from './modalStyles'
import Spinner from './Spinner'
import type { MouseEvent } from 'react'
import type { TransformedGame } from '../helpers/transformGame'
import type { Platform } from '../helpers/platform'

const GameViewer = lazy(() => import('./GameViewer'))

// For a game row that is also a link to the game on its site: a plain
// click or tap opens the viewer, while ctrl/cmd/middle-click still open
// the site in a new tab.
export function opensViewer(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
    return false
  event.preventDefault()
  return true
}

function GameViewerModal({
  game,
  username,
  platform,
  onClose,
}: {
  // The game to show, or null when closed.
  game: TransformedGame | null
  username: string
  platform: Platform
  onClose: () => void
}) {
  const isPhone = useMediaQuery('(max-width: 768px)')
  const router = useRouter()

  // The address that reopens this game: its day on the Games page, with
  // the game named. The same wherever the viewer was opened from.
  const shareUrl = game
    ? window.location.origin +
      router.buildLocation({
        to: '/games/$username',
        params: { username },
        search: gameSearch(game, platform),
      }).href
    : ''

  return (
    <Modal
      opened={!!game}
      onClose={onClose}
      title={game ? `${game.whitePlayer} vs ${game.blackPlayer}` : ''}
      size="54rem"
      radius="lg"
      centered
      fullScreen={isPhone}
      zIndex={300}
      styles={{
        ...brandModalStyles,
        title: { fontWeight: 700 },
      }}
    >
      {game && (
        <Suspense fallback={<Spinner />}>
          {/* Keyed so a different game starts from its first move. */}
          <GameViewer
            key={game.url}
            game={game}
            username={username}
            platform={platform}
            shareUrl={shareUrl}
          />
        </Suspense>
      )}
    </Modal>
  )
}

export default GameViewerModal
