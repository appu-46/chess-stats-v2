// The lists under the switch player search: the signed-in user's
// favourites, then the famous players (the famous_players table), both
// narrowed by whatever is typed in it. SwitchPlayer owns the highlighted
// row, since the arrow keys are pressed in its search box; the index runs
// through both lists, favourites first. Only mounted while the modal is
// open, so everything is fetched then, from the same caches as the
// favourites page and the homepage.
import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useQuery } from '@tanstack/react-query'
import { SiChessdotcom, SiLichess } from 'react-icons/si'
import useGoogleUser from '../hooks/useGoogleUser'
import useGetFavsofUser from '../hooks/useGetFavsofUser'
import useFetchChessProfileBulk from '../hooks/useFetchChessProfileBulk'
import useFamousPlayers from '../hooks/useFamousPlayers'
import useBottomFade from '../hooks/useBottomFade'
import { apiProfile } from '../services/apiStats'
import { parsePlatform } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

export type PlayerPick = {
  username: string
  name: string | null
  // undefined: not known yet, so it's looked up (chess.com only; lichess
  // has no profile photos). null: the player has none.
  avatar: string | null | undefined
  platform: Platform
  // Under the name instead of the bare @username, e.g. "Streamer".
  tagline?: string | null
}

export type PickSection = { title: string; players: Array<PlayerPick> }

type Current = { username: string; platform: Platform } | null

const keyOf = (player: { username: string; platform: Platform }) =>
  `${player.platform}:${player.username.toLowerCase()}`

// Favourites (alphabetical) and famous players (in the table's order)
// matching `query` by username or real name, without the player on screen
// and without listing a favourite twice. Sections with no matches are left
// out; favourites are empty when signed out.
export function usePlayerPicks(
  query: string,
  current: Current,
): Array<PickSection> {
  const { data: googleUser } = useGoogleUser()
  const sub = googleUser?.sub ?? ''
  const { data: favs } = useGetFavsofUser(sub)
  const favKeys =
    favs?.map((fav) => ({
      player_id: String(fav.player_id),
      platform: parsePlatform(fav.platform),
    })) ?? []
  const { data: profiles } = useFetchChessProfileBulk(favKeys)
  const famous = useFamousPlayers()

  const favourites: Array<PlayerPick> =
    sub && profiles
      ? profiles
          .map((row) => ({
            username: row.username,
            name: row.name,
            avatar: row.avatar,
            platform: parsePlatform(row.platform),
          }))
          .sort((a, b) => a.username.localeCompare(b.username))
      : []
  const favouriteKeys = new Set(favourites.map(keyOf))
  const famousPicks: Array<PlayerPick> = famous
    .filter((player) => !favouriteKeys.has(keyOf(player)))
    .map((player) => ({ ...player, avatar: undefined }))

  const needle = query.trim().toLowerCase()
  const shown = (player: PlayerPick) =>
    !(current && keyOf(player) === keyOf(current)) &&
    (!needle ||
      player.username.toLowerCase().includes(needle) ||
      !!player.name?.toLowerCase().includes(needle))

  return [
    { title: 'Favourites', players: favourites.filter(shown) },
    { title: 'Famous players', players: famousPicks.filter(shown) },
  ].filter((section) => section.players.length > 0)
}

// A chess.com profile photo not in the profile cache. Cached for the
// visit; a failure (such as chess.com's rate limit) just shows the initial.
function useAvatar(player: PlayerPick) {
  const lookUp = player.avatar === undefined && player.platform === 'chess.com'
  const { data } = useQuery({
    queryKey: ['avatar', player.platform, player.username.toLowerCase()],
    queryFn: async () =>
      ((await apiProfile(player.username)).avatar as string | undefined) ??
      null,
    enabled: lookUp,
    staleTime: Infinity,
    retry: false,
  })
  return lookUp ? data : player.avatar
}

const Section = styled.div`
  margin-top: 1.1rem;
`

const Heading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

// Desktop only: phones have no arrow keys.
const KeyHint = styled.span`
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;

  kbd {
    padding: 0 0.3rem;
    border-radius: 4px;
    border: 1px solid currentColor;
    font-family: inherit;
    font-size: 0.7rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`

// About six rows, then both lists scroll together, fading at the bottom
// like the leaderboard while there's more below.
const Scroll = styled.div<{ $fadeBottom: boolean }>`
  max-height: 17.5rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

  & > div + div > ${Heading} {
    margin-top: 0.9rem;
  }

  ${({ $fadeBottom }) =>
    $fadeBottom
      ? `-webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 3rem), transparent);
         mask-image: linear-gradient(to bottom, #000 calc(100% - 3rem), transparent);`
      : ''}
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`

// The leaderboard's row, a size smaller. The highlighted row (arrow keys
// or the pointer) gets the brand tint only, no coloured edge.
const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  cursor: pointer;

  /* Stronger in dark mode, where a faint mint barely shows on the
     modal's deep green. */
  &[aria-selected='true'] {
    background: light-dark(rgba(52, 163, 126, 0.12), rgba(110, 231, 183, 0.15));
  }

  & > svg {
    flex-shrink: 0;
    margin-left: auto;
    opacity: 0.55;
  }
`

const Avatar = styled.img`
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
`

const AvatarFallback = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--brand-fill);
  color: var(--on-brand);
  font-size: 0.85rem;
  font-weight: 700;
`

const Names = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const Name = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`

const Handle = styled.span`
  font-size: 0.75rem;
  opacity: 0.6;
`

function PickAvatar({ player }: { player: PlayerPick }) {
  const avatar = useAvatar(player)
  const initial = (player.name || player.username).charAt(0).toUpperCase()
  return avatar ? (
    <Avatar src={avatar} alt="" />
  ) : (
    <AvatarFallback aria-hidden>{initial}</AvatarFallback>
  )
}

function PlayerPicks({
  sections,
  active,
  onActiveChange,
  onPick,
  id,
}: {
  sections: Array<PickSection>
  // Index of the highlighted row across all sections, or -1.
  active: number
  onActiveChange: (index: number) => void
  onPick: (player: PlayerPick) => void
  // For the option ids, so they're unique on the page.
  id: string
}) {
  const { ref, fadeBottom, onScroll } = useBottomFade<HTMLDivElement>([
    sections,
  ])
  const rowRefs = useRef<Array<HTMLLIElement | null>>([])

  // Keep the row picked with the arrow keys in view.
  useEffect(() => {
    rowRefs.current[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!sections.length) return null

  let index = 0
  return (
    <Section>
      <Scroll ref={ref} $fadeBottom={fadeBottom} onScroll={onScroll}>
        {sections.map((section, sectionIndex) => (
          <div key={section.title}>
            <Heading>
              <span>{section.title}</span>
              {sectionIndex === 0 && (
                <KeyHint>
                  <kbd>↑</kbd> <kbd>↓</kbd> to pick, <kbd>Enter</kbd> to open
                </KeyHint>
              )}
            </Heading>
            <List role="listbox" aria-label={section.title}>
              {section.players.map((player) => {
                const rowIndex = index++
                const PlatformLogo =
                  player.platform === 'lichess' ? SiLichess : SiChessdotcom
                const subline = player.tagline
                  ? player.tagline
                  : player.name
                    ? `@${player.username}`
                    : null
                return (
                  <Row
                    key={keyOf(player)}
                    id={`${id}-${rowIndex}`}
                    ref={(node) => {
                      rowRefs.current[rowIndex] = node
                    }}
                    role="option"
                    aria-selected={rowIndex === active}
                    onMouseEnter={() => onActiveChange(rowIndex)}
                    onClick={() => onPick(player)}
                  >
                    <PickAvatar player={player} />
                    <Names>
                      <Name>{player.name || player.username}</Name>
                      {subline && <Handle>{subline}</Handle>}
                    </Names>
                    <PlatformLogo size={13} aria-label={player.platform} />
                  </Row>
                )
              })}
            </List>
          </div>
        ))}
      </Scroll>
    </Section>
  )
}

export default PlayerPicks
