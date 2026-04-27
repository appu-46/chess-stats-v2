import { useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { Title } from '@mantine/core'
import styled from 'styled-components'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Form from '../ui/Form'
import ErrorMessage from '../ui/ErrorMessage'
// import FloatingTab from '../ui/FloatingTab'
import { useTabContext } from '../contexts/TabContext'
import { oauthSignIn } from '../services/OAuth'
import HorizontalDivider from '../ui/Divider'
import GoogleOAuthButton from '../ui/GoogleAuthButton'
import useGoogleUser from '../hooks/useGoogleUser'
import useUpdateChessUsername from '../hooks/useUpdateChessUsername'
import useGetUser from '../hooks/useGetUser'

const StyledLogin = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-direction: column;
  justify-content: center;
`

type Inputs = {
  username: string
}

function Login() {
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

  // Once Google user is available, upsert them

  const {
    given_name: FirstName,
    family_name: LastName,
    chessUsername = '',
  } = googleUser ?? {}

  console.log(dbUser)

  if (dbUser?.chessUserId) {
    navigate({
      to: '/profile/$username',
      params: { username: dbUser.chessUserId },
    })
  }

  async function onSubmit(data: { username: string }) {
    if (dbUser?.chessUserId) {
      navigate({
        to: '/profile/$username',
        params: { username: dbUser.chessUserId },
      })
    }
    if (googleUser) {
      await mutateAsync({ sub: googleUser.sub, chessUsername: data.username })
    }
    if (activeTab === 0) {
      navigate({
        to: '/profile/$username',
        params: { username: data.username },
      })
    } else {
      navigate({
        to: '/stats/$username',
        params: { username: data.username },
      })
    }
  }

  return (
    <StyledLogin>
      {/* <FloatingTab /> */}
      {googleUser && (
        <>
          <Title>
            Welcome, {FirstName} {LastName}
          </Title>
          {googleUser && !chessUsername && (
            <label>We don't have your chess.com username stored yet...</label>
          )}
        </>
      )}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Enter your Chess.com username"
          {...register('username', { required: true })}
        />
        {errors.username && <ErrorMessage message="Username is mandatory!" />}

        <Button type="submit">Submit</Button>
      </Form>
      {!googleUser && (
        <>
          <HorizontalDivider>
            <label>
              Sign in with Google so we remember your Chess.com username
            </label>
          </HorizontalDivider>
          <GoogleOAuthButton onClick={oauthSignIn} />
        </>
      )}
    </StyledLogin>
  )
}

export default Login
