import styled from 'styled-components'
import { FaChessPawn, FaGlobe, FaTrophy, FaTwitch } from 'react-icons/fa'
import { MdDateRange, MdUpdate } from 'react-icons/md'
import { HiUserGroup } from 'react-icons/hi'
import { TbPremiumRights } from 'react-icons/tb'
import { useParams } from '@tanstack/react-router'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import PlayerAvatar from '../ui/PlayerAvatar'
import InfoBlock from '../ui/InfoBlock'
import { formatDate } from '../helpers/DateFormat'
import useCountry from '../hooks/useCountry'
import FloatingTab from '../ui/FloatingTab'
import StyledProfilething from '../ui/Profilething'

export const StyledContainer = styled.div`
  display: grid;
  grid-gap: 0.25rem;
  align-items: ceter;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`
const StyledProfile = styled.div`
  display: grid;
  grid-template-columns: 20rem 20rem;
  grid-gap: 1rem;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`
const StyledName = styled.h1`
  font-size: 54px;
  font-weight: 500;
`

const StyledCountry = styled.h2`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  font-size: 42px;
  font-weight: 400;
`
const StyledOnline = styled.h2`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  font-size: 24px;
  font-weight: 200;
`
const StyledHeader = styled.div`
  margin: 1rem 0rem 1rem 0rem;
  display: flex;
  flex-direction: column;
  justify-items: center;
  max-width: 100rem;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ccc;
  margin: 1rem 0;
  width: 100%;
`

const TitleBG = styled.span`
  border-radius: 2.5rem;
  background-color: #7d2828;
  padding: 0.1rem 0.95rem;
}
`

function Profile() {
  const { username } = useParams({ from: '/profile/$username' })

  const { data: profile, isPending: isFetchingProfile } = useProfile(username)
  const { data: countryDetail } = useCountry(profile?.country)

  if (isFetchingProfile) return <Spinner />

  const {
    avatar: playerAvatar = null,
    // player_id = null,
    url = null,
    name: playerName = null,
    title = null,
    followers = null,
    last_online = null,
    joined = null,
    status = null,
    is_streamer = null,
    twitch_url = null,
    league = null,
  } = profile ?? {}

  return (
    <StyledContainer>
      <FloatingTab />
      <StyledProfilething>
        {playerAvatar === null ? (
          <FaChessPawn size="14rem" />
        ) : (
          <PlayerAvatar src={playerAvatar} alt="user-avatar" />
        )}
        <StyledHeader>
          {
            <StyledName>
              {title && <TitleBG>{title}</TitleBG>}{' '}
              <a href={url} target="blank">
                {playerName}
              </a>
            </StyledName>
          }
          <StyledCountry>
            {countryDetail?.code == 'XX' ? (
              <FaGlobe />
            ) : (
              <img
                style={{ height: '48px' }}
                src={`https://flagsapi.com/${countryDetail?.code}/flat/32.png`}
                alt="country-flag"
              />
            )}

            {countryDetail?.name}
          </StyledCountry>
          <StyledOnline>
            <MdUpdate />
            {formatDate(last_online)}
          </StyledOnline>
          <StyledOnline>
            <HiUserGroup /> {followers?.toLocaleString('en-IN')}
          </StyledOnline>
        </StyledHeader>
      </StyledProfilething>
      <Divider />
      <StyledProfile>
        <InfoBlock>
          <MdDateRange />
          {formatDate(joined)}
        </InfoBlock>
        <InfoBlock>
          <TbPremiumRights /> {status?.toUpperCase()}
        </InfoBlock>
        {is_streamer === true && (
          <InfoBlock>
            <FaTwitch />{' '}
            <a href={twitch_url} target="blank">
              {twitch_url === null ? 'No channel found' : twitch_url}
            </a>
          </InfoBlock>
        )}
        <InfoBlock>
          <FaTrophy /> {league}
        </InfoBlock>
      </StyledProfile>
    </StyledContainer>
  )
}

export default Profile
