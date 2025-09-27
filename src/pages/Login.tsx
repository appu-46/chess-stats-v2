import { useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import styled from 'styled-components'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Form from '../ui/Form'
import ErrorMessage from '../ui/ErrorMessage'

const StyledLogin = styled.div`
  margin: 1.5rem 0rem 1.5rem 0rem;
  display: flex;
  align-items: center;
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

  function onSubmit(data: { username: string }) {
    navigate({ to: '/stats/$username', params: { username: data.username } })
  }

  return (
    <StyledLogin>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Enter your username"
          {...register('username', { required: true })}
        />
        {errors.username && <ErrorMessage message="Username is mandatory!" />}

        <Button type="submit">Submit</Button>
      </Form>
    </StyledLogin>
  )
}

export default Login
