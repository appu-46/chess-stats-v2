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
  grid-template-columns: 35vh 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;

  /* optional: gap between sidebar and content */
  gap: 0;

  /* make content scrollable if needed */
  overflow: hidden;

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
