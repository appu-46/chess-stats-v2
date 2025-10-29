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
import StyledProfilething from '../ui/Profilething'

export const StyledContainer = styled.div`
  display: grid;
  grid-gap: 0.25rem;
  align-items: ceter;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`
export const StyledProfiler = styled.div`
  display: grid;
  grid-template-columns: 2fr 2px 30rem;
  align-items: ceter;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`
const StyledProfile = styled.div`
  display: grid;
  grid-template-columns: 20rem;
  grid-template-rows: 5rem 5rem 5rem;
  grid-gap: 1rem;
  align-content: center;
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
  width: 2px;
  background-color: white; /* or use theme color */
  height: 100%;
  opacity: 0.2;
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
    <StyledProfiler>
      <StyledProfilething>
        <a href={url} target="_blank">
          {playerAvatar === null ? (
            <FaChessPawn size="14rem" />
          ) : (
            <PlayerAvatar src={playerAvatar} alt="user-avatar" />
          )}
        </a>
        <StyledHeader>
          {
            <StyledName>
              {title && <TitleBG>{title}</TitleBG>}{' '}
              <a href={url} target="_blank">
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
            {formatDate(last_online).formattedDateTime}
          </StyledOnline>
          <StyledOnline>
            <HiUserGroup /> {followers?.toLocaleString('en-IN')}
          </StyledOnline>
        </StyledHeader>
      </StyledProfilething>
      <Divider />
      <StyledProfile>
        <InfoBlock>
          <MdDateRange size={30} />
          {formatDate(joined).formattedDateTime}
        </InfoBlock>
        <InfoBlock>
          <TbPremiumRights size={30} /> {status?.toUpperCase()}
        </InfoBlock>
        {is_streamer === true && (
          <a href={twitch_url} target="_blank">
            <InfoBlock>
              <FaTwitch size={30} />{' '}
              {twitch_url === null
                ? 'No channel found'
                : twitch_url.replace('https://twitch.tv', '')}
            </InfoBlock>
          </a>
        )}
        <InfoBlock>
          <FaTrophy size={30} /> {league}
        </InfoBlock>
      </StyledProfile>
    </StyledProfiler>
  )
}

export default Profile
