import styled from 'styled-components'

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 120rem;
`

const Logo = styled.img`
  margin-top: 20px;
  width: 5rem;
  height: 5rem;
`
const Title = styled.h1`
  color: #233b46;
  margin-top: 15px;
  font-family: 'Cantarell';
  font-size: 64px;
  font-weight: 600;
`

export default function Header() {
  return (
    <StyledHeader>
      <Logo src="/knight.svg" alt="webapp logo" />
      <Title> Chess Stats </Title>
    </StyledHeader>
  )
}
