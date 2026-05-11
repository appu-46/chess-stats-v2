import styled from 'styled-components'
import { FaGlobe, FaStopwatch, FaSun, FaTrophy, FaTwitch } from 'react-icons/fa'
import { IoMdTrendingUp } from 'react-icons/io'
import { BsClockHistory } from 'react-icons/bs'
import { SiChessdotcom, SiStackblitz } from 'react-icons/si'
import { RiVipDiamondFill } from 'react-icons/ri'
import { MdDateRange } from 'react-icons/md'
import { GiBulletBill } from 'react-icons/gi'
import { BiSolidUpArrow } from 'react-icons/bi'
import { HiUserGroup } from 'react-icons/hi'
import { useParams } from '@tanstack/react-router'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { formatDate } from '../helpers/DateFormat'
import useCountry from '../hooks/useCountry'
import useStats from '../hooks/useStats'
// ── Layout ──────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  width: auto;
`

const ProfileCard = styled.div`
  flex: 1;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  gap: 1rem;
  align-items: start;
`

const Avatar = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.3);
`

const AvatarPlaceholder = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
`

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`
const ProfileRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  flex: 1;
`
const IconRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1rem;
`

const Name = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const TitleBadge = styled.span`
  font-size: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #7d2828;
  font-weight: 1000;
`

const Username = styled.div`
  font-size: 0.95rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const MetaRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`
const MetaColumns = styled.div`
  display: flex;
  flex-direction: column;
`
const PeakItem = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 1.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.35rem 1rem 0.35rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`

const Country = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  img {
    height: 100%;
  }
`

// ── Quick Stats Card ────────────────────────────────────────────────
const StatsCard = styled.div`
  width: 500px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
`

const StatRow = styled.div`
  display: flex;
  transition: all 0.2s ease;
  justify-content: start;
  align-items: center;
  padding: 1rem;
  padding-left: 2.5rem;
  gap: 2.5rem;
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`
const PeakRating = styled.h2`
  font-size: 2.5rem;
  font-weight: 1000;
`

const MetaTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 400;
`

const MetaValue = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
`

const StatTitle = styled.div`
  font-size: 1rem;
  font-weight: 400;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`

function Profile() {
  const { username } = useParams({ from: '/profile/$username' })
  const { data: profile, isPending: isFetchingProfile } = useProfile(username)
  const { data: countryDetail } = useCountry(profile?.country)
  const {
    data: stats,
    isPending: isFetchingStats,
    error: errorStats,
  } = useStats(username)

  if (errorStats) return <p>{`${errorStats.message}`}</p>

  if (isFetchingProfile || isFetchingStats) return <Spinner />

  const {
    avatar: playerAvatar = null,
    url = null,
    name: playerName = null,
    title = null,
    followers = null,
    is_streamer = false,
    last_online = null,
    twitch_url = null,
    joined = null,
    status = null,
    league = null,
  } = profile ?? {}

  const timeControls = [
    {
      key: 'chess_blitz',
      label: 'Blitz',
      color: '#e3bd37',
      icon: <SiStackblitz size={35} color="#e3bd37" />,
    },
    {
      key: 'chess_rapid',
      label: 'Rapid',
      color: '#fa6d4b',

      icon: <FaStopwatch size={35} color="#fa6d4b" />,
    },
    {
      key: 'chess_bullet',
      label: 'Bullet',
      color: '#5d9bf0',
      icon: <GiBulletBill size={35} color="#5d9bf0" />,
    },
    {
      key: 'chess_daily',
      label: 'Daily',
      color: '#f7a233',
      icon: <FaSun size={35} color="#f7a233" />,
    },
  ] as const
  return (
    <PageWrapper>
      <ProfileCard>
        <ProfileRow>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {playerAvatar ? (
              <Avatar src={playerAvatar} alt={playerName || 'avatar'} />
            ) : (
              <AvatarPlaceholder>
                <SiChessdotcom size={60} />
              </AvatarPlaceholder>
            )}
          </a>

          <ProfileInfo>
            <Name>
              {title && <TitleBadge>{title}</TitleBadge>}
              <h1>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {playerName}
                </a>
              </h1>
              <span>•</span>
              <Username>@{username}</Username>
            </Name>
            <MetaRow>
              <MetaItem>
                <MdDateRange size={30} color="#22c55e" />
                <MetaColumns>
                  <MetaTitle>Joined</MetaTitle>
                  <MetaValue>{formatDate(joined).formattedDateTime}</MetaValue>
                </MetaColumns>
              </MetaItem>
              <MetaItem>
                <HiUserGroup size={30} color="#06b6d4" />
                <MetaColumns>
                  <MetaTitle>Followers</MetaTitle>
                  <MetaValue> {followers?.toLocaleString('en-IN')} </MetaValue>
                </MetaColumns>
              </MetaItem>
            </MetaRow>
            {countryDetail && (
              <Country>
                {countryDetail.code === 'XX' ? (
                  <FaGlobe />
                ) : (
                  <img
                    src={`https://flagsapi.com/${countryDetail.code}/flat/32.png`}
                    alt={countryDetail.name}
                  />
                )}
                {countryDetail.name}
              </Country>
            )}
          </ProfileInfo>
        </ProfileRow>
        <IconRow>
          <IoMdTrendingUp size={32} color="#fa143c" />{' '}
          <StatValue> Peak Ratings</StatValue>
        </IconRow>
        <ProfileRow style={{ gap: '1.25rem' }}>
          {timeControls.map(({ key, label, color, icon }) => {
            const stat = stats?.[key]
            if (!stat) return null
            return (
              <a href={stat?.best?.game} target="_blank">
                <PeakItem
                  key={key}
                  style={{ borderBottom: `2px solid ${color}` }}
                >
                  <MetaRow>
                    <IconRow>
                      {icon}
                      <StatTitle
                        style={{ color: color, fontSize: '1.5rem' }}
                      >{`${label}`}</StatTitle>
                    </IconRow>
                  </MetaRow>
                  <MetaRow>
                    <PeakRating>{stat?.best?.rating}</PeakRating>
                  </MetaRow>
                  <MetaRow>
                    <IconRow style={{ gap: '0.25rem' }}>
                      <BiSolidUpArrow size={15} color="#00c500" />
                      <span style={{ fontSize: '0.75rem', color: '#00c500' }}>
                        {stat?.best?.rating - stat?.last.rating}
                      </span>
                      <span style={{ fontSize: '0.75rem' }}>from current</span>
                    </IconRow>
                  </MetaRow>
                </PeakItem>
              </a>
            )
          })}
        </ProfileRow>
      </ProfileCard>

      <StatsCard>
        <StatRow>
          <FaTrophy size={40} color="#22c55e" />
          <MetaColumns>
            <StatTitle>League</StatTitle>
            <StatValue>{league || '—'}</StatValue>
          </MetaColumns>
        </StatRow>

        <StatRow>
          <RiVipDiamondFill size={40} color="#3b82f6" />
          <MetaColumns>
            <StatTitle>Status</StatTitle>
            <StatValue>{status?.toUpperCase() || '—'}</StatValue>
          </MetaColumns>
        </StatRow>

        <StatRow>
          <BsClockHistory size={40} color="yellow" />
          <MetaColumns>
            <StatTitle>Last Active</StatTitle>
            <StatValue>{formatDate(last_online).formattedDateTime}</StatValue>
          </MetaColumns>
        </StatRow>
        {is_streamer === true && (
          <a href={twitch_url} target="_blank">
            <StatRow>
              <FaTwitch size={40} color="#a855f7" />
              <MetaColumns>
                <StatTitle>Twitch</StatTitle>
                <StatValue>
                  {twitch_url === null
                    ? 'No channel found'
                    : twitch_url.replace('https://twitch.tv/', '')}
                </StatValue>
              </MetaColumns>
            </StatRow>
          </a>
        )}
      </StatsCard>
    </PageWrapper>
  )
}

export default Profile
