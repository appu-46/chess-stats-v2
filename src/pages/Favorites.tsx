import styled from 'styled-components'
import { useNavigate, useParams } from '@tanstack/react-router'

import { useLayoutEffect, useRef, useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { FaGlobe, FaRegHeart, FaTrash } from 'react-icons/fa'
import { SiChessdotcom, SiLichess } from 'react-icons/si'
import { MdFavorite } from 'react-icons/md'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteFav } from '../hooks/useDeleteFav'
import useFetchChessProfileBulk from '../hooks/useFetchChessProfileBulk'
import useUpsertChessUser from '../hooks/useUpsertChessUser'
import useGetFavsofUser from '../hooks/useGetFavsofUser'
import { fetchPlayerProfile } from '../services/apiPlayer'
import ErrorMessage from '../ui/ErrorMessage'
import Spinner from '../ui/Spinner'
import useUpsertFav from '../hooks/useUpsertFav'
import PlayerSearchBar from '../ui/PlayerSearchBar'
import {
  DEFAULT_PLATFORM,
  PLATFORM_LABELS,
  parsePlatform,
  platformSearch,
} from '../helpers/platform'
import PlatformBadge from '../ui/PlatformBadge'
import { PageEyebrow } from '../ui/PageHeader'
import { formatLastActive } from '../helpers/DateFormat'
import type { ReactNode } from 'react'
import type { Platform } from '../helpers/platform'

// ── Layout ──────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.5rem 2rem 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem 0;
    gap: 1rem;
  }
`

// Same rhythm as PageHeader on the player pages: eyebrow, then title.
const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  & > :first-child {
    margin-bottom: 0.25rem;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const CountPill = styled.span`
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  font-variant-numeric: tabular-nums;

  [data-mantine-color-scheme='light'] & {
    background: rgba(0, 0, 0, 0.06);
  }
`

const Subtitle = styled.p`
  margin: 0;
  opacity: 0.6;
`

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
`

const SectionHeading = styled.div`
  margin: 0 0 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

// "Saved players" over the cards, with the count beside it.
const ListHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.85rem;

  ${SectionHeading} {
    margin: 0;
    /* It's an h2, and the phone styles force every h2 to 1.25rem. */
    font-size: 0.75rem !important;
  }
`

// ── Add player ──────────────────────────────────────────────────────

const Errors = styled.div`
  margin-top: 0.75rem;
`

// ── Player cards ────────────────────────────────────────────────────

const PlayerGrid = styled.div<{ $fadeBottom: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: 1rem;
  /* Room for the cards' hover lift, which the scroll area would clip. */
  padding: 4px 4px 0;
  margin: -4px -4px 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

  ${({ $fadeBottom }) =>
    $fadeBottom
      ? `-webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 3rem), transparent);
         mask-image: linear-gradient(to bottom, #000 calc(100% - 3rem), transparent);`
      : ''}
`

// Up to this many cards show in full; past it the list becomes a scroll
// area that ends right after this card (3 rows of 3 on desktop).
const VISIBLE_CARDS = 9

// The grid's height is measured from the cards rather than hard-coded, so
// the cut-off lands after the 9th card whether the layout is 3, 2 or 1
// column wide. The bottom edge fades while there's more to scroll to.
function PlayerList({
  count,
  children,
}: {
  count: number
  children: ReactNode
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState<number | null>(null)
  const [fadeBottom, setFadeBottom] = useState(false)

  function updateFade() {
    const grid = gridRef.current
    if (!grid) return
    setFadeBottom(grid.scrollTop + grid.clientHeight < grid.scrollHeight - 1)
  }

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    function measure() {
      if (!grid) return
      const cutoff = grid.children[VISIBLE_CARDS - 1] as HTMLElement | undefined
      if (count <= VISIBLE_CARDS || !cutoff) {
        setMaxHeight(null)
        setFadeBottom(false)
        return
      }
      const gridTop = grid.getBoundingClientRect().top - grid.scrollTop
      const cutoffBottom = cutoff.getBoundingClientRect().bottom
      // Card bottom, plus room for the bottom row's hover lift.
      setMaxHeight(Math.ceil(cutoffBottom - gridTop) + 4)
      updateFade()
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    return () => observer.disconnect()
  }, [count])

  return (
    <PlayerGrid
      ref={gridRef}
      $fadeBottom={fadeBottom}
      style={maxHeight ? { maxHeight } : undefined}
      onScroll={updateFade}
    >
      {children}
    </PlayerGrid>
  )
}

const PlayerCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.1rem 1.15rem 0.95rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    border-color: rgba(187, 247, 208, 0.45);
  }

  [data-mantine-color-scheme='light'] & {
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.6);

    &:hover,
    &:focus-visible {
      border-color: rgba(20, 83, 45, 0.45);
    }
  }
`

const PlayerTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  /* Keep text clear of the remove button in the corner. */
  padding-right: 2rem;
`

const Avatar = styled.img`
  flex-shrink: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px rgba(187, 247, 208, 0.25);
`

const AvatarPlaceholder = styled.div`
  flex-shrink: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 2px rgba(187, 247, 208, 0.25);
`

const PlayerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
`

const NameLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
`

const ChessTitle = styled.span`
  flex-shrink: 0;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  background: #7d2828;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
`

const DisplayName = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const HandleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  min-width: 0;
`

const Muted = styled.span`
  opacity: 0.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const PlayerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.82rem;

  [data-mantine-color-scheme='light'] & {
    border-top-color: rgba(0, 0, 0, 0.07);
  }
`

const Country = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  opacity: 0.8;

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
`

const Activity = styled.span<{ $recent: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  opacity: ${({ $recent }) => ($recent ? 1 : 0.6)};

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $recent }) =>
      $recent ? '#22c55e' : 'rgba(150, 150, 150, 0.7)'};
  }
`

const RemoveButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  opacity: 0.45;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;

  &:hover,
  &:focus-visible {
    opacity: 1;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.12);
  }
`

const EmptyState = styled(Panel)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
`

// Green dot for players seen in the last six hours.
const RECENT_HOURS = 6

function Favorites() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { sub } = useParams({ from: '/favourites/$sub' })
  const { mutate: deleteFav } = useDeleteFav(sub)

  const {
    data: favs,
    isPending: isFetchingFavs,
    error: favsError,
  } = useGetFavsofUser(sub)

  const favKeys =
    favs?.map((fav) => ({
      player_id: String(fav.player_id),
      platform: parsePlatform(fav.platform),
    })) ?? []

  const {
    data: favsProfile,
    isPending: isFetchingProfile,
    error: profileError,
  } = useFetchChessProfileBulk(favKeys)

  const { mutateAsync: upsertFav } = useUpsertFav()
  const { mutateAsync: upsertChessProfile } = useUpsertChessUser()

  type Inputs = { username: string }

  const [platform, setPlatform] = useState<Platform>(DEFAULT_PLATFORM)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ defaultValues: { username: '' } })
  const { field: usernameField } = useController({
    name: 'username',
    control,
    rules: { required: true, validate: (v) => !!v.trim() },
  })

  async function onSubmit(data: { username: string }) {
    const username = data.username.trim()
    if (!username) return
    setSubmitError(null)

    try {
      const profile = await fetchPlayerProfile(platform, username)
      await upsertChessProfile(profile)
      await upsertFav({
        user_sub: sub,
        player_id: profile.playerId,
        platform,
      })
      reset()
      queryClient.invalidateQueries({ queryKey: ['favs', sub] })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : `Couldn't add ${username} from ${PLATFORM_LABELS[platform]}`,
      )
    }
  }

  if (isFetchingFavs || isFetchingProfile) return <Spinner />
  if (favsError) return <span>{favsError.message}</span>
  if (profileError) return <span>{profileError.message}</span>

  function handleDelete(
    e: React.MouseEvent,
    player_id: string,
    favPlatform: Platform,
    name: string,
  ) {
    e.stopPropagation()

    if (window.confirm(`Remove ${name} from favourites?`)) {
      deleteFav({ player_id, platform: favPlatform, user_sub: sub })
    }
  }

  const count = favs?.length ?? 0

  return (
    <PageWrapper>
      <Header>
        <PageEyebrow icon={MdFavorite} section="Favourites" />
        <TitleRow>
          <Title>Your favourite players</Title>
        </TitleRow>
        <Subtitle>
          Players you've saved. Open one to see their profile, stats and games.
        </Subtitle>
      </Header>

      <Panel>
        <SectionHeading>Add a player</SectionHeading>
        <PlayerSearchBar
          platform={platform}
          onPlatformChange={setPlatform}
          // Not "username": browsers treat that as a login field and
          // autofill the signed-in account's email into it.
          name="tracked-player"
          value={usernameField.value}
          onChange={usernameField.onChange}
          onBlur={usernameField.onBlur}
          submitLabel={isSubmitting ? 'Adding…' : 'Add player'}
          submitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
        {(errors.username || submitError) && (
          <Errors>
            {errors.username && (
              <ErrorMessage message="Enter a username to add." />
            )}
            {submitError && <ErrorMessage message={submitError} />}
          </Errors>
        )}
      </Panel>

      {favsProfile?.length === 0 ? (
        <EmptyState>
          <FaRegHeart size={26} style={{ opacity: 0.6 }} />
          <strong>No favourites yet</strong>
          <Subtitle>
            Add a Chess.com or Lichess username above, or use Favourite on any
            player's profile.
          </Subtitle>
        </EmptyState>
      ) : (
        <section>
          <ListHeading>
            <SectionHeading as="h2">Saved players</SectionHeading>
            <CountPill>
              {count} {count === 1 ? 'player' : 'players'}
            </CountPill>
          </ListHeading>
          <PlayerList count={favsProfile?.length ?? 0}>
            {favsProfile?.map((fav) => {
              const favPlatform = parsePlatform(fav.platform)
              const PlatformIcon =
                favPlatform === 'lichess' ? SiLichess : SiChessdotcom
              const lastOnlineSeconds =
                new Date(fav.lastonline).getTime() / 1000
              // Stored as an ISO string or null; new Date(null) would be 1970.
              const hasLastOnline =
                !!fav.lastonline && Number.isFinite(lastOnlineSeconds)
              const isRecent =
                hasLastOnline &&
                Date.now() / 1000 - lastOnlineSeconds < RECENT_HOURS * 3600
              const displayName = fav.name || fav.username
              const openProfile = () =>
                navigate({
                  to: '/profile/$username',
                  params: { username: fav.username },
                  search: platformSearch(favPlatform),
                })

              return (
                <PlayerCard
                  key={`${favPlatform}:${fav.player_id}`}
                  role="link"
                  tabIndex={0}
                  onClick={openProfile}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') openProfile()
                  }}
                >
                  <RemoveButton
                    type="button"
                    aria-label={`Remove ${displayName}`}
                    title="Remove"
                    onClick={(e) =>
                      handleDelete(
                        e,
                        String(fav.player_id),
                        favPlatform,
                        displayName,
                      )
                    }
                  >
                    <FaTrash size={13} />
                  </RemoveButton>

                  <PlayerTop>
                    {fav.avatar ? (
                      <Avatar src={fav.avatar} alt="" />
                    ) : (
                      <AvatarPlaceholder>
                        <PlatformIcon size={22} />
                      </AvatarPlaceholder>
                    )}
                    <PlayerText>
                      <NameLine>
                        {fav.title && <ChessTitle>{fav.title}</ChessTitle>}
                        <DisplayName>{displayName}</DisplayName>
                      </NameLine>
                      <HandleLine>
                        {/* Without a real name the handle is already the title. */}
                        {fav.name && <Muted>@{fav.username}</Muted>}
                        <PlatformBadge platform={favPlatform} />
                      </HandleLine>
                    </PlayerText>
                  </PlayerTop>

                  <PlayerFooter>
                    {fav.country ? (
                      <Country>
                        {fav.country.code === 'XX' ? (
                          <FaGlobe size={14} />
                        ) : (
                          <img
                            src={`https://flagsapi.com/${fav.country.code}/flat/32.png`}
                            alt=""
                          />
                        )}
                        <Muted style={{ opacity: 1 }}>{fav.country.name}</Muted>
                      </Country>
                    ) : (
                      <span />
                    )}
                    <Activity $recent={isRecent}>
                      {hasLastOnline
                        ? `Active ${formatLastActive(lastOnlineSeconds).replace(
                            /^Just now$/,
                            'just now',
                          )}`
                        : 'Activity unknown'}
                    </Activity>
                  </PlayerFooter>
                </PlayerCard>
              )
            })}
          </PlayerList>
        </section>
      )}
    </PageWrapper>
  )
}

export default Favorites
