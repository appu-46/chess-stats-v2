import { useMantineColorScheme } from '@mantine/core'
import { Link, useNavigate } from '@tanstack/react-router'
import '@mantine/core/styles.css'
import styled from 'styled-components'
import DarkModeToggle from '../ui/DarkModeToggle'

export const StyledHeader = styled.header`
  margin: 1rem 0;
  backdrop-filter: blur(4px);
  display: flex;
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
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
`

export function useLogoSrc() {
  const { colorScheme } = useMantineColorScheme()
  return colorScheme === 'dark' ? '/knight-dark.svg' : '/knight.svg'
}

// The big centred title, shown on the home page only. Elsewhere the brand
// lives at the top of the sidebar (or in CompactHeader on phones).
export default function Header() {
  const logoSrc = useLogoSrc()
  const navigate = useNavigate()

  function handleClick() {
    navigate({ to: '/', search: { changeUsername: false } })
  }

  return (
    <>
      <StyledHeader>
        <Logo src={logoSrc} alt="webapp logo" onClick={() => handleClick()} />
        <Title> Chess Stats </Title>
      </StyledHeader>
    </>
  )
}

const StyledCompactHeader = styled.header`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3.5rem;
    padding: 0 0.75rem;
  }
`

const CompactBrand = styled.div`
  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
  }

  img {
    width: 1.75rem;
    height: 1.75rem;
  }

  span {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
`

// Phones only: the sidebar is a bottom tab bar there, with no room for the
// brand or the theme switch, so they sit above the page instead. The home
// page has its own big title, so it gets the switch alone.
export function CompactHeader({ showBrand }: { showBrand: boolean }) {
  const logoSrc = useLogoSrc()

  return (
    <StyledCompactHeader>
      {showBrand ? (
        <CompactBrand>
          <Link to="/" search={{ changeUsername: false }}>
            <img src={logoSrc} alt="" />
            <span>Chess Stats</span>
          </Link>
        </CompactBrand>
      ) : (
        <span />
      )}
      <DarkModeToggle />
    </StyledCompactHeader>
  )
}
