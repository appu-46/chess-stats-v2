import { useForm } from 'react-hook-form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { FaChartLine, FaGamepad, FaTrophy } from 'react-icons/fa'
import styled from 'styled-components'
import { useMantineColorScheme } from '@mantine/core'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Form from '../ui/Form'
import ErrorMessage from '../ui/ErrorMessage'
import { useTabContext } from '../contexts/TabContext'
import { oauthSignIn } from '../services/OAuth'
import GoogleOAuthButton from '../ui/GoogleAuthButton'
import useGoogleUser from '../hooks/useGoogleUser'
import useUpdateChessUsername from '../hooks/useUpdateChessUsername'
import useGetUser from '../hooks/useGetUser'
import { Logo, StyledHeader } from '../components/Header'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 80vh;
  gap: 3rem;
`

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  jutify-item: center;
  gap: 1.5rem;
  text-align: center;
  max-width: 700px;
`

const GradientTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  // background: linear-gradient(135deg, #a78bfa, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.7;
  max-width: 550px;
  line-height: 1.6;
  margin: 0;
`

const SearchRow = styled.div`
  display: flex;
  gap: 1rem;
  // width: 100%;
  max-width: 600px;
  align-items: center;
`

const WelcomeText = styled.p`
  font-size: 1rem;
  opacity: 0.8;
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  width: 100%;
`

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 12px;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.65);
    border: 1.5px solid #333;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

const Searchbox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 2rem 5rem;
  border-radius: 1rem;
  width: max-content;
  align-items: center;
  justify-content: center;
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
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

const FeatureIconWrapper = styled.div<{ color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
`

const FeatureTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`

const FeatureDesc = styled.p`
  font-size: 0.875rem;
  opacity: 0.6;
  margin: 0;
  line-height: 1.5;
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  opacity: 0.4;
  font-size: 0.85rem;
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: currentColor;
  }
`

type Inputs = { username: string }

function Login() {
  const { colorScheme } = useMantineColorScheme()

  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()
  const { activeTab } = useTabContext()
  const { data: googleUser } = useGoogleUser()
  const { data: dbUser } = useGetUser(googleUser?.sub)
  const { mutateAsync } = useUpdateChessUsername()
  const { changeUsername } = useSearch({ from: '/' })

  function handleClick() {
    navigate({ to: '/', search: { changeUsername: true } })
  }

  const { given_name: FirstName } = googleUser ?? {}

  if (dbUser?.chessUserId && !changeUsername) {
    navigate({
      to: '/profile/$username',
      params: { username: dbUser.chessUserId },
    })
  }

  async function onSubmit(data: { username: string }) {
    if (googleUser) {
      await mutateAsync({ sub: googleUser.sub, chessUsername: data.username })
    }
    if (activeTab === 0) {
      navigate({
        to: '/profile/$username',
        params: { username: data.username },
      })
    } else {
      navigate({ to: '/stats/$username', params: { username: data.username } })
    }
  }

  return (
    <PageWrapper>
      <Hero>
        <StyledHeader style={{ margin: 0 }}>
          <Logo
            src={colorScheme === 'dark' ? '/knight-dark.svg' : '/knight.svg'}
            alt="webapp logo"
            onClick={() => handleClick()}
          />
          <GradientTitle>Chess Stats</GradientTitle>
        </StyledHeader>
        <Subtitle>
          Analyze your Chess.com performance with beautiful visualizations,
          track rating progress, and review game history
        </Subtitle>

        {googleUser && (
          <WelcomeText>
            Welcome back,{' '}
            <strong style={{ color: '#34d399' }}>{FirstName} 👋</strong>
          </WelcomeText>
        )}
        <div
          style={{
            borderRadius: '1rem',
            padding: '0.12rem',
            background:
              'linear-gradient(135deg, #1e5bf2 0%, #22d3ee 30%, white 60%, #a855f7 100%)',
          }}
        >
          <Searchbox>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '600' }}>
              Enter your Chess.com username
            </h1>

            <SearchRow>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Input
                  style={{
                    border: '1.5px solid #a855f7',
                    borderRadius: '1rem',
                  }}
                  placeholder="for e.g. gothamchess"
                  {...register('username', { required: true })}
                />
                <Button style={{ padding: '0rem 3.5rem' }}>Analyze</Button>
              </Form>
            </SearchRow>
            {errors.username && (
              <ErrorMessage message="Username is mandatory!" />
            )}
          </Searchbox>
        </div>
      </Hero>

      {!googleUser && (
        <>
          <Divider>Sign in with Google to save your username</Divider>
          <GoogleOAuthButton onClick={oauthSignIn} />
        </>
      )}

      {/* Feature cards */}
      <FeatureGrid>
        <FeatureCard>
          <FeatureIconWrapper color="#3b3f8c">
            <FaChartLine color="#818cf8" size={20} />
          </FeatureIconWrapper>
          <FeatureTitle>Rating History</FeatureTitle>
          <FeatureDesc>
            Track rating progression across Blitz, Bullet, and Rapid with
            interactive charts
          </FeatureDesc>
        </FeatureCard>
        <FeatureCard>
          <FeatureIconWrapper color="#5b2d6e">
            <FaTrophy color="#c084fc" size={20} />
          </FeatureIconWrapper>
          <FeatureTitle>Performance Stats</FeatureTitle>
          <FeatureDesc>
            View win rates, best ratings, total games, and detailed metrics
          </FeatureDesc>
        </FeatureCard>
        <FeatureCard>
          <FeatureIconWrapper color="#1e4d3b">
            <FaGamepad color="#34d399" size={20} />
          </FeatureIconWrapper>
          <FeatureTitle>Game History</FeatureTitle>
          <FeatureDesc>
            Browse recent games with details and direct links to Chess.com
          </FeatureDesc>
        </FeatureCard>
      </FeatureGrid>
    </PageWrapper>
  )
}

export default Login
