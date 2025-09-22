import { useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Form from '../ui/Form'
import ErrorMessage from '../ui/ErrorMessage'
import useStats from '../hooks/useStats'
import Spinner from '../ui/Spinner'

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
  const [username, setUsername] = useState<string>('appu_46')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  function onSubmit(data: Inputs) {
    setUsername(data.username)
  }
  const { data: stats, isPending: isFetchingStats } = useStats(username)
  console.log(stats)

  if (isFetchingStats) return <Spinner size="large" />

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
