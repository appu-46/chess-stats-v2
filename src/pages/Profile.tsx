import styled from 'styled-components'
import { FaChessPawn, FaTwitch } from 'react-icons/fa'
import { MdDateRange, MdUpdate } from 'react-icons/md'
import { TbPremiumRights } from 'react-icons/tb'
import { useParams } from '@tanstack/react-router'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import PlayerAvatar from '../ui/PlayerAvatar'
import InfoBlock from '../ui/InfoBlock'
import { formatDate } from '../helpers/DateFormat'
import useCountry from '../hooks/useCountry'

const StyledProfile = styled.div`
  display: grid;
  grid-template-columns: 15rem 15rem;
  grid-gap: 0.25rem;
  align-items: ceter;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`

function Profile() {
  const { username } = useParams({ from: '/profile/$username' })
  const { data: profile, isPending: isFetchingProfile } = useProfile(username)
  const { data: countryDetail } = useCountry(profile?.country)

  if (isFetchingProfile) return <Spinner />

  const {
    avatar: playerAvatar = null,
    // player_id = null,
    // url = null,
    name: playerName = null,
    // title = null,
    // followers = null,
    // location = null,
    last_online = null,
    joined = null,
    status = null,
    is_streamer = null,
    twitch_url = null,
    // league = null,
  } = profile ?? {}

  return (
    <StyledProfile>
      <PlayerAvatar src={playerAvatar} alt="user-avatar" />
      <InfoBlock>
        <FaChessPawn />
        {playerName}
      </InfoBlock>
      <InfoBlock>
        <img
          src={`https://flagsapi.com/${countryDetail?.code}/flat/24.png`}
          alt="country-flag"
        />
        {countryDetail?.name}
      </InfoBlock>
      <InfoBlock>
        <MdUpdate />
        {formatDate(last_online)}
      </InfoBlock>
      <InfoBlock>
        <MdDateRange />
        {formatDate(joined)}
      </InfoBlock>
      <InfoBlock>
        <TbPremiumRights /> {status}
      </InfoBlock>

      {is_streamer === true && (
        <InfoBlock>
          <FaTwitch /> {twitch_url}
        </InfoBlock>
      )}
    </StyledProfile>
  )
}

export default Profile
