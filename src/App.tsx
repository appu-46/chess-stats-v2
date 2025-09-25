import styled from 'styled-components'
import { Outlet } from '@tanstack/react-router'
import AppLayout from './ui/AppLayout'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 120rem;
`

function App() {
  return (
    <StyledLayout>
      <AppLayout />
      <Outlet />
    </StyledLayout>
  )
}

export default App
