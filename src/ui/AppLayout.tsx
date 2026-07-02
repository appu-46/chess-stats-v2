import styled from 'styled-components'
import Login from '../pages/Login'

const Container = styled.div`
  margin: 1.2rem;
  display: flex;
  align-item: center;
`

export const StyledAppLayout = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-areas:
    'sidebar header'
    'sidebar main'
    'footer footer';
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: auto 1fr auto;
  transition: grid-template-columns 0.3s ease;

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
    transition: margin-left 0.3s ease;
  }

  > footer {
    grid-area: footer;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'header'
      'main'
      'footer';

    /* The sidebar becomes a fixed bottom bar (see NavbarMinimal.module.css),
       so it is taken out of the grid flow here. */
    > nav {
      grid-area: unset;
    }

    > main {
      overflow-x: hidden;
    }
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
