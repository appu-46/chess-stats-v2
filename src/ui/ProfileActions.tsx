// Buttons beside the player's name on the profile: save them as a
// favourite (signed-in users only), and open their page on the platform.
import styled from 'styled-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tooltip } from '@mantine/core'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import useGoogleUser from '../hooks/useGoogleUser'
import useGetFavsofUser from '../hooks/useGetFavsofUser'
import { deleteFav, upsertChessUser, upsertFav } from '../services/apiUser'
import { PLATFORM_LABELS, parsePlatform } from '../helpers/platform'
import type { PlayerProfile } from '../helpers/normalizePlayer'

const FAV_COLOR = '#f43f5e'

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: auto;

  @media (max-width: 768px) {
    margin-left: 0;
    justify-content: center;
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

function ProfileActions({ profile }: { profile: PlayerProfile }) {
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
        <span>
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
      <OpenLink href={profile.url} target="_blank" rel="noopener noreferrer">
        <span>Open on {PLATFORM_LABELS[profile.platform]}</span>
        <FiExternalLink size={13} aria-hidden />
      </OpenLink>
    </Actions>
  )
}

export default ProfileActions
