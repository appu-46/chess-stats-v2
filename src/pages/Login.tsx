import styled from 'styled-components'
import Input from '../ui/Input'

const StyledLogin = styled.div`
  display: flex;
  align-items: center;
`

function Login() {
  return (
    <StyledLogin>
      <Input type="text" id="username" placeholder="Enter your username" />
    </StyledLogin>
  )
}

export default Login
