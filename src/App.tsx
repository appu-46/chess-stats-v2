import styled from 'styled-components'
import { Outlet } from '@tanstack/react-router'
import AppLayout from './ui/AppLayout'
import Header from './components/Header'

const StyledLayout = styled.body`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 120rem;
`

function App() {
  return (
    <StyledLayout>
      <Header />
      <AppLayout />
      <Outlet />
    </StyledLayout>
  )
}

export default App
