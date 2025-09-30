import { useMantineColorScheme } from '@mantine/core'
import '@mantine/core/styles.css'
import styled from 'styled-components'
import DarkModeToggle from '../ui/DarkModeToggle'

const StyledHeader = styled.div`
  margin: 2rem 0rem 2rem 0rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  max-width: 120rem;
`

const Logo = styled.img`
  transition:
    opacity 0.3s ease,
    filter 0.3s ease,
    transform 0.3s ease !important;
  width: 5rem;
  height: 5rem;
`
const Title = styled.h1`
  font-family: 'Cantarell';
  font-size: 64px;
  font-weight: 600;
`

export default function Header() {
  const { colorScheme } = useMantineColorScheme()
  return (
    <>
      <StyledHeader>
        <Logo
          src={colorScheme === 'dark' ? '/knight-dark.svg' : '/knight.svg'}
          alt="webapp logo"
        />
        <Title> Chess Stats </Title>
        <DarkModeToggle />
      </StyledHeader>
    </>
  )
}
