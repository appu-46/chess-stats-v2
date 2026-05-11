import styled from 'styled-components'
import { Outlet } from '@tanstack/react-router'
import AppLayout from './ui/AppLayout'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`
const MainContent = styled.main`
  flex: auto;
`
function App() {
  return (
    <StyledLayout>
      <AppLayout />
      <MainContent>
        <Outlet />
      </MainContent>
    </StyledLayout>
  )
}

export default App
