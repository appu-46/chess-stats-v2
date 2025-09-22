import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import styled from 'styled-components'
import { Outlet } from '@tanstack/react-router'
import AppLayout from './ui/AppLayout'
import Header from './components/Header'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 120rem;
`
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StyledLayout>
        <Header />
        <AppLayout />
        <Outlet />
      </StyledLayout>
    </QueryClientProvider>
  )
}

export default App
