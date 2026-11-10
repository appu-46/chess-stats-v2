// Links to one game in the viewer: the Games page for the day it was
// played, with ?game=<id> saying which of that day's games to open.
import { platformSearch } from './platform'
import type { Platform } from './platform'

// The id the game's site gives it: the last part of its address there
// ("https://www.chess.com/game/live/123" -> "123"). Lichess adds
// "/black" when the player had Black, which isn't part of the id.
export function gameId(url: string): string {
  const parts = url.split(/[?#]/)[0].split('/').filter(Boolean)
  const last = parts.at(-1) ?? ''
  return last === 'black' || last === 'white' ? (parts.at(-2) ?? '') : last
}

// The Games page search that opens `game`. Its day comes from the same
// 'YYYY.MM.DD' key the page groups games by.
export function gameSearch(
  game: { url: string; gameEndDate: string },
  platform: Platform,
) {
  const [year, month, day] = game.gameEndDate.split('.')
  return {
    year,
    month,
    day,
    game: gameId(game.url),
    ...platformSearch(platform),
  }
}
