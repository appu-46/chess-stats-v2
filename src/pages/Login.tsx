import { useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { Title } from '@mantine/core'
import styled from 'styled-components'
import { FcGoogle } from 'react-icons/fc'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Form from '../ui/Form'
import ErrorMessage from '../ui/ErrorMessage'
// import FloatingTab from '../ui/FloatingTab'
import { useTabContext } from '../contexts/TabContext'
import { oauthSignIn } from '../services/OAuth'
import HorizontalDivider from '../ui/Divider'
import GoogleOAuthButton from '../ui/GoogleAuthButton'

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

  function onSubmit(data: { username: string }) {
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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Enter your username"
          {...register('username', { required: true })}
        />
        {errors.username && <ErrorMessage message="Username is mandatory!" />}

        <Button type="submit">Submit</Button>
      </Form>
      <HorizontalDivider>
        <Title> Or Login </Title>
      </HorizontalDivider>
      <GoogleOAuthButton onClick={oauthSignIn} />
    </StyledLogin>
  )
}

export default Login
