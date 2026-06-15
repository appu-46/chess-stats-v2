import styled from 'styled-components'
import { useNavigate, useParams } from '@tanstack/react-router'

import { useForm } from 'react-hook-form'
import { HiUsers } from 'react-icons/hi'
import { FaCircle, FaGlobe, FaRegStar, FaTrash } from 'react-icons/fa'
import { SiChessdotcom } from 'react-icons/si'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteFav } from '../hooks/useDeleteFav'
import useFetchChessProfileBulk from '../hooks/useFetchChessProfileBulk'
import useUpsertChessUser from '../hooks/useUpsertChessUser'
import Form from '../ui/Form'
import Input from '../ui/Input'
import Button from '../ui/Button'
import useGetFavsofUser from '../hooks/useGetFavsofUser'
import { apiProfile } from '../services/apiStats'
import ErrorMessage from '../ui/ErrorMessage'
import Spinner from '../ui/Spinner'
import useUpsertFav from '../hooks/useUpsertFav'
import { SearchRow } from './Login'
import { MetaRow, ProfileInfo, TitleBadge } from './Profile'
import { IconRow } from './Stats'

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0rem 5rem;
  justify-content: center;
  flex-direction: column;
`

const Searchbox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 1rem;
  align-items: center;
  justify-content: start;
  background: radial-gradient(110% 110% at 50% 10%, #0c1530 0%, #050917 100%);
  box-shadow:
    0px 20px 50px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
  opacity: 0.9;

  [data-mantine-color-scheme='light'] & {
    background: radial-gradient(110% 110% at 50% 10%, #eee 0%, #eee 100%);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-around;
  flex-direction: row;
  width: 100%;
`
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`
// const PlayerName = styled.h1`
//   font-size: 1.5rem;
//   font-weight: 700;
//   margin: 0;
// `

const TitleSearch = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`

const Avatar = styled.img`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.5);
`
const Name = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`
const StatRow = styled.div`
  display: flex;
  transition: all 0.2s ease;
  justify-content: start;
  align-items: center;
  padding: 0.5rem 1rem;
  gap: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`
const FavoriteCard = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`
const Country = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  img {
    height: 100%;
  }
`
const DeleteBg = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.55);
    transform: translateY(-2px);
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(0, 0, 0, 0.55);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255);

    &:hover {
      background: rgba(255, 255, 255, 0.01);
      border-color: rgba(0, 0, 0, 0.6);
      translatex: (-2px);
      color: #111;
      transform: translateY(-2px);
    }
  }
`
const AvatarPlaceholder = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
`

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: space-around;
`
const FavsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-bottom: 2rem;
  height: 72vh;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  -webkit-mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
  gap: 1rem;
  justify-content: start;
  border-radius: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`

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

  const player_id_favs = favs?.map((fav) => fav?.player_id) ?? []

  const {
    data: favsProfile,
    isPending: isFetchingProfile,
    error: profileError,
  } = useFetchChessProfileBulk(player_id_favs)

  const { mutateAsync: upsertFav } = useUpsertFav()
  const { mutateAsync: upsertChessProfile } = useUpsertChessUser()

  type Inputs = { username: string }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  async function onSubmit(data: { username: string }) {
    if (data.username) {
      const chessUser = await apiProfile(data.username)
      const response = await fetch(chessUser?.country)
      const code = await response.json()

      await upsertChessProfile({
        player_id: chessUser.player_id,
        username: data.username,
        name: chessUser.name,
        url: chessUser.url,
        title: chessUser.title,
        avatar: chessUser.avatar,
        country: code,
        country_api: chessUser.country,
        country_flag_url: `https://flagsapi.com/${code.code}/flat/32.png`,
        profile_createdat: new Date(chessUser.joined * 1000).toISOString(),
        lastonline: new Date(chessUser.last_online * 1000).toISOString(),
      })

      await upsertFav({
        user_sub: sub,
        player_id: chessUser.player_id,
      })

      queryClient.invalidateQueries({ queryKey: ['favs', sub] })
    }
  }

  if (isFetchingFavs || isFetchingProfile) return <Spinner />
  if (favsError) return <span>{favsError.message}</span>
  if (profileError) return <span>{profileError.message}</span>

  function handleDelete(e: React.MouseEvent, player_id: number, name: string) {
    e.stopPropagation()

    if (window.confirm(`Remove ${name} from favourites?`)) {
      deleteFav({ player_id: player_id, user_sub: sub })
    }
  }

  return (
    <PageWrapper>
      <TitleWrapper>
        <div>
          <Title>Your Tracked Players</Title>
          <span>Monitor performance, rating and activity</span>
        </div>
        <StatRow>
          <HiUsers size={32} color="#1f8cd6" />
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
          >
            <Name>{favs?.length}</Name>
            <Name>Players Tracked</Name>
          </div>
        </StatRow>
      </TitleWrapper>
      <MainContainer>
        <Searchbox>
          <div
            style={{
              background: 'rgb(0,0,0,0.22)',
              padding: '1rem',
              borderRadius: '50%',
            }}
          >
            <FaRegStar size={32} color="#1f8cd6" />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <TitleSearch>Add a favorite</TitleSearch>
            <span style={{ textWrap: 'wrap', textAlign: 'center' }}>
              {' '}
              Track any player and never miss their progress
            </span>
          </div>

          <SearchRow>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Input
                style={{
                  border: '1.5px solid #a855f7',
                  borderRadius: '1rem',
                  width: '20rem',
                }}
                placeholder="Enter chess.com username"
                {...register('username', { required: true })}
              />
              <Button>Add Player</Button>
            </Form>
          </SearchRow>
          {errors.username && <ErrorMessage message="Username is mandatory!" />}
        </Searchbox>

        <FavsListContainer>
          {favsProfile?.length === 0 ? (
            <h1>Your Favourite players will be listed here</h1>
          ) : (
            favsProfile?.map((fav) => {
              const lastOnline = new Date(fav.lastonline)
              const now = new Date()

              const diffMs = now.getTime() - lastOnline.getTime()
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
              const diffDays = Math.floor(diffHours / 24)
              return (
                <FavoriteCard
                  key={fav.player_id}
                  onClick={() =>
                    navigate({
                      to: '/profile/$username',
                      params: { username: fav.username },
                    })
                  }
                >
                  <MetaRow>
                    {fav.avatar === null ? (
                      <AvatarPlaceholder>
                        <SiChessdotcom size={32} />
                      </AvatarPlaceholder>
                    ) : (
                      <Avatar src={fav.avatar} alt="player-avatar" />
                    )}
                    <ProfileInfo>
                      <Name>
                        {fav.title && (
                          <TitleBadge
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                            }}
                          >
                            {fav.title}
                          </TitleBadge>
                        )}{' '}
                        {fav.name} <span>•</span> @{fav.username}
                      </Name>

                      <MetaRow>
                        {fav.country && (
                          <Country>
                            {fav.country.code === 'XX' ? (
                              <FaGlobe />
                            ) : (
                              <img
                                src={`https://flagsapi.com/${fav.country.code}/flat/32.png`}
                                alt={fav.country.name}
                              />
                            )}
                            <span>{fav.country.name}</span>
                          </Country>
                        )}
                      </MetaRow>
                    </ProfileInfo>
                  </MetaRow>
                  <IconRow
                    style={{
                      width: '100%',
                      paddingLeft: '0.25rem',
                      gap: '0.45rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <IconRow style={{ padding: '0', gap: '0.5rem' }}>
                      <FaCircle
                        color={
                          diffHours < 6
                            ? '#02f902'
                            : 'rgba(103, 103, 103, 0.64)'
                        }
                        stroke="1px solid black"
                      />
                      <span>
                        Last online: {diffHours < 24 ? diffHours : diffDays}{' '}
                        {diffHours < 24 ? 'hours' : 'days'} ago
                      </span>
                    </IconRow>
                    <DeleteBg
                      onClick={(e) => handleDelete(e, fav.player_id, fav.name)}
                    >
                      <FaTrash
                        color="crimson"
                        style={{ cursor: 'pointer', marginLeft: 'auto' }}
                      />
                      <>Delete</>
                    </DeleteBg>
                  </IconRow>
                </FavoriteCard>
              )
            })
          )}
        </FavsListContainer>
      </MainContainer>
    </PageWrapper>
  )
}

export default Favorites
