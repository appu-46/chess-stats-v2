import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { FcGoogle } from 'react-icons/fc'
import {
  IconChartLine,
  IconChessKnight,
  IconHeart,
  IconListDetails,
} from '@tabler/icons-react'
import styled from 'styled-components'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { useTabContext } from '../contexts/TabContext'
import { signInWithGoogle } from '../services/OAuth'
import useGoogleUser from '../hooks/useGoogleUser'
import useUpdateChessUsername from '../hooks/useUpdateChessUsername'
import useGetUser from '../hooks/useGetUser'
import Header, { StyledHeader } from '../components/Header'
import PlatformToggle from '../ui/PlatformToggle'
import UsernameAutocomplete from '../ui/UsernameAutocomplete'
import {
  DEFAULT_PLATFORM,
  PLATFORM_LABELS,
  parsePlatform,
  platformSearch,
} from '../helpers/platform'
import type { Platform } from '../helpers/platform'
import type { Icon as TablerIcon } from '@tabler/icons-react'

// ── Layout ──────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1rem 2rem;

  @media (max-width: 768px) {
    gap: 2rem;
    padding: 0 0 2rem;
  }
`

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  text-align: center;
`

const Subtitle = styled.p`
  max-width: 34rem;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.75;
`

const Panel = styled.div`
  width: 100%;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
`

// ── Search ──────────────────────────────────────────────────────────

// The original gradient ring: a 2px gradient frame around an opaque panel.
const SearchRing = styled.div`
  width: 100%;
  padding: 2px;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    #34a37e 0%,
    #6ee7b7 40%,
    white 65%,
    #99f6e4 100%
  );
`

const SearchPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2.25rem 2.5rem 2rem;
  border-radius: 16px;
  background: radial-gradient(110% 110% at 50% 10%, #0c2018 0%, #04120c 100%);

  [data-mantine-color-scheme='light'] & {
    background: radial-gradient(110% 110% at 50% 10%, #dcefe6 0%, #f1faf6 100%);
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1.1rem;
  }
`

const SearchHeading = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 34rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const InputSlot = styled.div`
  flex: 1;
  min-width: 0;
`

const AnalyzeButton = styled(Button)`
  height: 3rem;
  padding: 0 1.75rem;
  font-size: 1rem;
  font-weight: 600;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`

const QuickStart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
`

const QuickLabel = styled.span`
  opacity: 0.7;
`

const Chip = styled.button`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--brand-border);
  background: transparent;
  color: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.85;

  &:hover,
  &:focus-visible {
    opacity: 1;
    background: light-dark(rgba(20, 83, 45, 0.08), rgba(187, 247, 208, 0.08));
  }

  small {
    opacity: 0.6;
  }
`

const SignInLine = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0;
  font-size: 0.9rem;

  & > span {
    opacity: 0.75;
  }
`

const GoogleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.12);
  }

  [data-mantine-color-scheme='light'] & {
    border-color: rgba(0, 0, 0, 0.15);
    background: #fff;
  }
`

const Welcome = styled.p`
  margin: 0;
  font-size: 0.95rem;

  strong {
    color: var(--brand-soft);
  }

  [data-mantine-color-scheme='light'] & strong {
    color: var(--brand);
  }
`

// ── Features ────────────────────────────────────────────────────────

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const FeatureCard = styled(Panel)`
  display: flex;
  gap: 0.9rem;
  padding: 1.1rem 1.2rem;
  text-align: left;

  /* && outranks the global "* { transition: ... !important }" theme rule,
     which would otherwise drop the lift's transition. */
  && {
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease !important;
  }

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(187, 247, 208, 0.3);
  }

  [data-mantine-color-scheme='light'] &:hover {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(20, 83, 45, 0.3);
  }
`

const FeatureIcon = styled.span<{ $bg: string; $fg: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  color: ${({ $fg }) => $fg};
  background: ${({ $bg }) => $bg};
`

const FeatureTitle = styled.h3`
  margin: 0 0 0.25rem;
  font-size: 0.98rem;
  font-weight: 600;
`

const FeatureDesc = styled.p`
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  opacity: 0.75;
`

// The original feature colours (indigo, purple, green), plus pink for the
// fourth card.
const FEATURES: Array<{
  icon: TablerIcon
  title: string
  desc: string
  bg: string
  fg: string
}> = [
  {
    icon: IconChartLine,
    bg: '#3b3f8c',
    fg: '#818cf8',
    title: 'Rating over time',
    desc: 'Every time control on one chart, from the last week to all time, with a day-by-day breakdown.',
  },
  {
    icon: IconChessKnight,
    bg: '#5b2d6e',
    fg: '#c084fc',
    title: 'Openings & streaks',
    desc: 'Your best and worst openings with each colour, win streaks and how you bounce back after a loss.',
  },
  {
    icon: IconListDetails,
    bg: '#1e4d3b',
    fg: '#34d399',
    title: 'Match history',
    desc: 'Any day’s games with opponents, openings and how each one ended, linked to the original game.',
  },
  {
    icon: IconHeart,
    bg: '#6b2340',
    fg: '#f472b6',
    title: 'Tracked players',
    desc: 'Follow friends, rivals and favourite streamers across Chess.com and Lichess in one list.',
  },
]

const EXAMPLES: Array<{ username: string; platform: Platform }> = [
  { username: 'Hikaru', platform: 'chess.com' },
  { username: 'MagnusCarlsen', platform: 'chess.com' },
  { username: 'DrNykterstein', platform: 'lichess' },
]

type Inputs = { username: string }

function Login() {
  const navigate = useNavigate()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ defaultValues: { username: '' } })
  const { activeTab } = useTabContext()
  const { data: googleUser } = useGoogleUser()
  const { data: dbUser } = useGetUser(googleUser?.sub)
  const { mutateAsync } = useUpdateChessUsername()
  const { changeUsername } = useSearch({ from: '/' })

  const firstName: string | undefined = googleUser?.given_name
  const savedPlatform = parsePlatform(dbUser?.chessPlatform)
  const [platform, setPlatform] = useState<Platform>(DEFAULT_PLATFORM)

  // Start on whichever platform the signed-in user last saved.
  useEffect(() => {
    if (dbUser?.chessPlatform) setPlatform(savedPlatform)
  }, [dbUser?.chessPlatform])

  // Signed-in users with a saved username go straight to their profile,
  // unless they came here to change it.
  useEffect(() => {
    if (dbUser?.chessUserId && !changeUsername) {
      navigate({
        to: '/profile/$username',
        params: { username: dbUser.chessUserId },
        search: platformSearch(savedPlatform),
      })
    }
  }, [dbUser?.chessUserId, changeUsername])

  function openPlayer(username: string, playerPlatform: Platform) {
    navigate({
      to: activeTab === 0 ? '/profile/$username' : '/stats/$username',
      params: { username },
      search: platformSearch(playerPlatform),
    })
  }

  async function onSubmit(data: Inputs) {
    const username = data.username.trim()
    if (googleUser) {
      await mutateAsync({
        sub: googleUser.sub,
        chessUsername: username,
        platform,
      })
    }
    openPlayer(username, platform)
  }

  const isChanging = !!googleUser && !!changeUsername

  return (
    <PageWrapper>
      <Hero>
        <StyledHeader style={{ margin: 0 }}>
          <Header />
        </StyledHeader>
        <Subtitle>
          Ratings, openings and game history for any Chess.com or Lichess
          player, in one place.
        </Subtitle>
        {firstName && (
          <Welcome>
            Welcome back, <strong>{firstName}</strong> 👋
          </Welcome>
        )}
      </Hero>

      <SearchRing>
        <SearchPanel>
          <SearchHeading>
            {isChanging
              ? 'Change your saved username'
              : googleUser
                ? 'Your username'
                : 'Look up a player'}
          </SearchHeading>

          <PlatformToggle value={platform} onChange={setPlatform} />

          <SearchForm onSubmit={handleSubmit(onSubmit)}>
            <InputSlot>
              <Controller
                name="username"
                control={control}
                rules={{ required: true, validate: (v) => !!v.trim() }}
                render={({ field }) => (
                  <UsernameAutocomplete
                    platform={platform}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    fullWidth
                    placeholder={`${PLATFORM_LABELS[platform]} username`}
                  />
                )}
              />
            </InputSlot>
            <AnalyzeButton>{isChanging ? 'Save' : 'Analyze'}</AnalyzeButton>
          </SearchForm>

          {errors.username && <ErrorMessage message="Enter a username." />}

          {!isChanging && (
            <QuickStart>
              <QuickLabel>Try:</QuickLabel>
              {EXAMPLES.map(({ username, platform: examplePlatform }) => (
                <Chip
                  key={username}
                  type="button"
                  onClick={() => openPlayer(username, examplePlatform)}
                >
                  {username}
                  {examplePlatform === 'lichess' && <small> · Lichess</small>}
                </Chip>
              ))}
            </QuickStart>
          )}
        </SearchPanel>
      </SearchRing>

      {!googleUser && (
        <SignInLine>
          <span>Save your username and track players —</span>
          <GoogleButton type="button" onClick={signInWithGoogle}>
            <FcGoogle size={16} aria-hidden />
            Sign in with Google
          </GoogleButton>
        </SignInLine>
      )}

      <FeatureGrid>
        {FEATURES.map(({ icon: Icon, title, desc, bg, fg }) => (
          <FeatureCard key={title}>
            <FeatureIcon $bg={bg} $fg={fg}>
              <Icon size={19} stroke={1.7} aria-hidden />
            </FeatureIcon>
            <div>
              <FeatureTitle>{title}</FeatureTitle>
              <FeatureDesc>{desc}</FeatureDesc>
            </div>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </PageWrapper>
  )
}

export default Login
