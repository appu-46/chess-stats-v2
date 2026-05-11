import styled from 'styled-components'
import Login from '../pages/Login'

const Container = styled.div`
  margin: 1.2rem;
  display: flex;
  align-item: center;
`

export const StyledAppLayout = styled.div`
  display: grid;
  grid-template-areas:
    'sidebar header'
    'sidebar main'
    'footer footer';
  grid-template-columns: 20vh 1fr;
  grid-template-rows: auto 1fr auto;
  // min-height: 45vh;

  gap: 0;

  > header {
    grid-area: header;
  }

  > nav {
    grid-area: sidebar;
  }

  > main {
    grid-area: main;
    overflow-y: auto;
    overflow-x: auto;
  }

  > footer {
    grid-area: footer;
  }
`
function AppLayout() {
  return (
    <Container>
      <Login />
    </Container>
  )
}

export default AppLayout
