import styled from 'styled-components'
import Login from '../pages/Login'

const Container = styled.div`
  margin: 1.2rem;
  display: flex;
  align-item: center;
`

function AppLayout() {
  return (
    <Container>
      <Login />
    </Container>
  )
}

export default AppLayout
