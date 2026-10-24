import styled from 'styled-components'
import { Link } from '@tanstack/react-router'
import { TbMapSearch } from 'react-icons/tb'

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 30rem;
  margin: 3rem auto;
  padding: 2.25rem 2rem;
  border-radius: 16px;
  text-align: center;
  background: light-dark(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.03));
  border: 1px solid light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.08));

  svg {
    color: light-dark(var(--brand), var(--brand-soft));
  }

  h1 {
    margin: 0.25rem 0 0;
    font-size: 1.3rem !important;
  }

  p {
    margin: 0;
    opacity: 0.75;
  }

  a {
    margin-top: 0.5rem;
    padding: 0.55rem 1.1rem;
    border-radius: 999px;
    background: var(--brand-fill);
    color: var(--on-brand);
    font-weight: 600;
    text-decoration: none;
  }
`

function PageNotFound() {
  return (
    <Card>
      <TbMapSearch size={30} aria-hidden />
      <h1>Page not found</h1>
      <p>There's nothing at this address. It may be an old or mistyped link.</p>
      <Link to="/" search={{ changeUsername: false }}>
        Back to search
      </Link>
    </Card>
  )
}

export default PageNotFound
