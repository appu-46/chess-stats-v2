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
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { formatDate } from '../helpers/DateFormat'
import useCountry from '../hooks/useCountry'
import useStats from '../hooks/useStats'
import { upsertChessUser } from '../services/apiUser'
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

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
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

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`
const ProfileRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
`
const IconRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1rem;
  width: max-content;
`

const Name = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const TitleBadge = styled.span`
  font-size: 1rem;
  padding: 0.25rem 0.65rem;
  border-radius: 12px;
  background: #7d2828;
  font-weight: 1000;
  color: white;
  width: fit-content;

  [data-mantine-color-scheme='light'] & {
    color: white;
  }
`

export const Username = styled.div`
  font-size: 0.95rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const MetaRow = styled.div`
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
  padding: 2rem 2rem;
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

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.35rem 1rem 0.35rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.08);

  border-radius: 8px;
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.35);
    border: 1.5px solid rgba(0, 0, 0, 0.08);
  }
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

const StatsCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
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
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
  const upsertMutation = useMutation({ mutationFn: upsertChessUser })
  const {
    data: stats,
    isPending: isFetchingStats,
    error: errorStats,
  } = useStats(username)

  useEffect(() => {
    if (!profile?.player_id || !countryDetail?.code) return

    upsertMutation.mutate({
      player_id: profile.player_id,
      username,
      name: profile.name,
      url: profile.url,
      title: profile.title,
      avatar: profile.avatar,
      country: countryDetail,
      country_api: profile.country,
      country_flag_url: `https://flagsapi.com/${countryDetail?.code}/flat/32.png`,
      profile_createdat: new Date(profile.joined * 1000).toISOString(),
      lastonline: new Date(profile.last_online * 1000).toISOString(),
    })
  }, [profile?.player_id, countryDetail?.code])

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

  const statsData = [
    {
      icon: <FaTrophy size={40} color="#22c55e" />,
      title: 'League',
      color: '#22c55e',
      value: league || '—',
      show: true, // Always show
    },
    {
      icon: <RiVipDiamondFill size={40} color="#3b82f6" />,
      title: 'Status',
      color: '#3b82f6',
      value: status?.toUpperCase() || '—',
      show: true,
    },
    {
      icon: <BsClockHistory size={40} color="yellow" />,
      title: 'Last Active',
      color: 'yellow',
      value: formatDate(last_online).formattedDateTime,
      show: true,
    },
    {
      icon: <FaTwitch size={40} color="#a855f7" />,
      title: 'Twitch',
      color: '#a855f7',
      value: twitch_url
        ? twitch_url.replace('https://twitch.tv/', '')
        : 'No channel found',
      link: twitch_url || null,
      show: is_streamer === true, // Conditional visibility
    },
  ]

  const timeControls = [
    {
      key: 'chess_blitz',
      label: 'Blitz',
      color: '#f59e0b',
      icon: <SiStackblitz size={35} color="#f59e0b" />,
    },
    {
      key: 'chess_rapid',
      label: 'Rapid',
      color: '#ef4444',

      icon: <FaStopwatch size={35} color="#ef4444" />,
    },
    {
      key: 'chess_bullet',
      label: 'Bullet',
      color: '#3b82f6',
      icon: <GiBulletBill size={35} color="#3b82f6" />,
    },
    {
      key: 'chess_daily',
      label: 'Daily',
      color: '#22c55e',
      icon: <FaSun size={35} color="#22c55e" />,
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
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Name>
                {title && <TitleBadge>{title}</TitleBadge>}
                <>{playerName}</>
                <span>•</span>
                <Username>@{username}</Username>
              </Name>
            </a>
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
              <a href={stat?.best?.game} target="_blank" key={key}>
                <PeakItem
                  key={key}
                  style={{
                    borderBottom: `3.5px solid ${color}`,
                    background: `linear-gradient(0deg,${color}60 0%,rgba(255, 255, 255, 0.03) 4%)`,
                  }}
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
        {statsData
          .filter((stat) => stat.show)
          .map((stat, index) => {
            const rowComponent = (
              <StatRow
                key={index}
                style={{
                  borderTop: `2px solid ${stat.color}`,
                  background: `linear-gradient(180deg,${stat.color}80 0%,transparent 4%)`,
                }}
              >
                {stat.icon}
                <MetaColumns>
                  <StatTitle>{stat.title}</StatTitle>
                  <StatValue>{stat.value}</StatValue>
                </MetaColumns>
              </StatRow>
            )

            return stat.link ? (
              <a
                href={stat.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                style={{ textDecoration: 'none' }}
              >
                {rowComponent}
              </a>
            ) : (
              rowComponent
            )
          })}
      </StatsCard>
    </PageWrapper>
  )
}

export default Profile
