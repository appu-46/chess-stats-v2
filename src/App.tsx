import styled from 'styled-components'
import { Outlet } from '@tanstack/react-router'
import AppLayout from './ui/AppLayout'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const MainContent = styled.main`
  display: flex;
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
