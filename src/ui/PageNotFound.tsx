import styled from 'styled-components'
import { Link } from '@tanstack/react-router'
import { TbMapSearch } from 'react-icons/tb'
import { MessageCard, MessageIcon } from './PageError'

// The same card as PageError; only the text and the link are its own.
const Card = styled(MessageCard)`
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
      <MessageIcon>
        <TbMapSearch size={24} aria-hidden />
      </MessageIcon>
      <h1>Page not found</h1>
      <p>There's nothing at this address. It may be an old or mistyped link.</p>
      <Link to="/" search={{ changeUsername: false }}>
        Back to search
      </Link>
    </Card>
  )
}

export default PageNotFound
