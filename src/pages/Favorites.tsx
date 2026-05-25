import styled from 'styled-components'

const PageWrapper = styled.div`
  display: flex;
`

const Title = styled.h1`
  font-size: 2rem;
`

function Favorites() {
  return (
    <PageWrapper>
      <Title>Favorites</Title>
    </PageWrapper>
  )
}

export default Favorites
