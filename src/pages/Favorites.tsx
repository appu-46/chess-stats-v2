import styled from 'styled-components'
import { useNavigate, useParams } from '@tanstack/react-router'

import { useForm } from 'react-hook-form'
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
import { SearchRow, Searchbox } from './Login'

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  flex-direction: column;
`
const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
  flex-direction: row;
`
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`
const PlayerName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`

const TitleSearch = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`

const Avatar = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.5);
`

const FavoriteCard = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1rem;
  padding: 2rem 1rem;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  width: fit-content;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(213, 213, 213, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: space-around;
`
const FavsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1rem;
  justify-content: space-around;
  background: radial-gradient(110% 110% at 50% 10%, #0c1530 0%, #050917 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0px 20px 50px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

function Favorites() {
  const navigate = useNavigate()

  const { sub } = useParams({ from: '/favourites/$sub' })

  const {
    data: favs,
    isPending: isFetchingFavs,
    error: favsError,
  } = useGetFavsofUser(sub)

  const player_id_favs = favs?.map((fav) => fav?.player_id)
  console.log(player_id_favs)
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

      await upsertChessProfile({
        player_id: chessUser.player_id,
        username: data.username,
        name: chessUser.name,
        url: chessUser.url,
        avatar: chessUser.avatar,
        profile_createdat: new Date(chessUser.joined * 1000).toISOString(),
        lastonline: new Date(chessUser.last_online * 1000).toISOString(),
      })

      await upsertFav({
        user_sub: sub,
        player_id: chessUser.player_id,
      })
    }
  }

  if (isFetchingFavs || isFetchingProfile) return <Spinner />
  if (favsError) return <span>{favsError.message}</span>
  if (profileError) return <span>{profileError.message}</span>

  return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <TitleWrapper>
          <div>
            <Title>Your Tracked Players</Title>
            <span>Monitor performance, rating and activity</span>
          </div>
          <div>{favs?.length}</div>
        </TitleWrapper>
      </div>
      <MainContainer>
        <Searchbox>
          <TitleSearch>Add a favorite</TitleSearch>

          <SearchRow>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Input
                style={{
                  border: '1.5px solid #a855f7',
                  borderRadius: '1rem',
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
          {favsProfile?.map((fav) => {
            return (
              <FavoriteCard>
                <Avatar src={fav.avatar} alt="player-avatar" />
                <PlayerName>{fav.name}</PlayerName>
              </FavoriteCard>
            )
          })}
        </FavsListContainer>
      </MainContainer>
    </PageWrapper>
  )
}

export default Favorites
