import { useMantineColorScheme } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import '@mantine/core/styles.css'
import styled from 'styled-components'

const StyledHeader = styled.header`
  margin: 1rem 0;
  display: flex;
  max-width: 75rem;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    margin: 1rem 0;
  }
`

export const Logo = styled.img`
  width: 4rem;
  height: 4rem;

  @media (max-width: 768px) {
    width: 3rem;
    height: 3rem;
  }
`

const Title = styled.h1`
  font-family: 'Cantarell';
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

export default function Header() {
  const { colorScheme } = useMantineColorScheme()
  const navigate = useNavigate()

  function handleClick() {
    navigate({ to: '/' })
  }

  return (
    <>
      <StyledHeader>
        <Logo
          src={colorScheme === 'dark' ? '/knight-dark.svg' : '/knight.svg'}
          alt="webapp logo"
          onClick={() => handleClick()}
        />
        <Title> Chess Stats </Title>
      </StyledHeader>
    </>
  )
}
