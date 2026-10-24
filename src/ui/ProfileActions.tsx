// Buttons beside the player's name on the profile: save them as a
// favourite (signed-in users only), share a stat card, compare them with
// someone, and open their page on the platform.
import styled from 'styled-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tooltip } from '@mantine/core'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { TbArrowsLeftRight } from 'react-icons/tb'
import { Link } from '@tanstack/react-router'
import useGoogleUser from '../hooks/useGoogleUser'
import useGetFavsofUser from '../hooks/useGetFavsofUser'
import { deleteFav, upsertChessUser, upsertFav } from '../services/apiUser'
import { PLATFORM_LABELS, parsePlatform } from '../helpers/platform'
import ShareStatCard from './ShareStatCard'
import type { PlayerProfile, PlayerStats } from '../helpers/normalizePlayer'

const FAV_COLOR = '#f43f5e'

// A 2×2 grid of equal-width buttons, narrow enough to sit beside the
// name rather than wrapping onto a row of its own. Phones keep one
// centred row, with Share and Compare as icons only.
const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin-left: auto;

  /* Each button (or the wrapper around it) fills its cell, a touch
     tighter than usual so the grid leaves the name room beside it. */
  & > *,
  & > * > a,
  & > * > button {
    width: 100%;
    justify-content: center;
  }

  & > * > a,
  & > * > button,
  & > a,
  & > button {
    padding: 0 0.75rem;
    font-size: 0.82rem;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-wrap: wrap;
    margin-left: 0;
    justify-content: center;

    & > *,
    & > * > a,
    & > * > button {
      width: auto;
    }
  }
`

const pill = `
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.25rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  background: light-dark(rgba(0, 0, 0, 0.03), rgba(255, 255, 255, 0.04));
  border: 1px solid light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.12));

  &:hover,
  &:focus-visible {
    background: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.08));
  }

  /* inherit: the global theme gives every span the page text colour. */
  span {
    color: inherit;
  }

  /* Small enough for both to share one line on a 390px phone. */
  @media (max-width: 768px) {
    gap: 0.35rem;
    padding: 0 0.75rem;
    font-size: 0.8rem;
  }
`

const FavButton = styled.button<{ $active: boolean }>`
  ${pill}

  ${({ $active }) =>
    $active &&
    `
    color: ${FAV_COLOR};
    background: color-mix(in srgb, ${FAV_COLOR} 12%, transparent);
    border-color: color-mix(in srgb, ${FAV_COLOR} 40%, transparent);

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, ${FAV_COLOR} 18%, transparent);
    }
  `}

  &:disabled {
    cursor: progress;
    opacity: 0.6;
  }

  /* Signed out: shown but unusable, like the sidebar's Favourites item. */
  &[data-blocked] {
    cursor: not-allowed;
    opacity: 0.4;
    background: none;
  }
`

const OpenLink = styled.a`
  ${pill}
`

// Label hidden on phones, like Compare's.
const ShareButton = styled(ShareStatCard)`
  ${pill}

  @media (max-width: 768px) {
    & > span {
      display: none;
    }
  }
`

// A styled wrapper rather than styled(Link), which would lose the
// router's typing of `search`.
const CompareSlot = styled.span`
  display: flex;

  a {
    ${pill}
  }

  /* Icon only on phones, so all the buttons keep to one line. */
  @media (max-width: 768px) {
    a > span {
      display: none;
    }
  }
`

function ProfileActions({
  profile,
  stats,
  username,
}: {
  profile: PlayerProfile
  stats: PlayerStats | undefined
  // As in the URL.
  username: string
}) {
  const queryClient = useQueryClient()
  const { data: googleUser } = useGoogleUser()
  const sub = googleUser?.sub ?? ''
  const { data: favs } = useGetFavsofUser(sub)

  const key = {
    user_sub: sub,
    player_id: profile.playerId,
    platform: profile.platform,
  }
  const isFav =
    favs?.some(
      (fav) =>
        String(fav.player_id) === profile.playerId &&
        parsePlatform(fav.platform) === profile.platform,
    ) ?? false

  const toggle = useMutation({
    mutationFn: async () => {
      if (isFav) return deleteFav(key)
      // The favourites list reads names and avatars from chess_profile.
      await upsertChessUser(profile)
      await upsertFav(key)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favs', sub] }),
  })

  const HeartIcon = isFav ? FaHeart : FaRegHeart

  return (
    <Actions>
      <Tooltip
        label="Sign in to save favourites"
        disabled={!!sub}
        openDelay={150}
        events={{ hover: true, focus: true, touch: true }}
      >
        {/* A disabled button fires no hover events, so the tooltip hangs
            off this wrapper instead. */}
        <span style={{ display: 'flex' }}>
          <FavButton
            type="button"
            $active={isFav}
            aria-pressed={sub ? isFav : undefined}
            disabled={!sub || toggle.isPending}
            data-blocked={!sub || undefined}
            onClick={() => toggle.mutate()}
          >
            <HeartIcon size={14} aria-hidden />
            <span>{isFav ? 'Favourited' : 'Favourite'}</span>
          </FavButton>
        </span>
      </Tooltip>
      <ShareButton profile={profile} stats={stats} username={username} />
      <CompareSlot>
        <Link
          to="/compare"
          search={{
            a: profile.username,
            ap: profile.platform === 'lichess' ? 'lichess' : undefined,
          }}
          aria-label={`Compare ${profile.username} with another player`}
        >
          <TbArrowsLeftRight size={14} aria-hidden />
          <span>Compare</span>
        </Link>
      </CompareSlot>
      <OpenLink href={profile.url} target="_blank" rel="noopener noreferrer">
        <span>Open on {PLATFORM_LABELS[profile.platform]}</span>
        <FiExternalLink size={13} aria-hidden />
      </OpenLink>
    </Actions>
  )
}

export default ProfileActions
