// What a page shows instead of its content when loading it failed: a
// friendly card saying what went wrong, with a retry where retrying could
// help. Pages render it for their own failed queries, and the router uses
// it as the error boundary for anything that crashes while rendering.
import styled from 'styled-components'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { TbAlertTriangle, TbRefresh, TbUserQuestion } from 'react-icons/tb'
import type { ErrorComponentProps } from '@tanstack/react-router'
import type { IconType } from 'react-icons'

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 30rem;
  margin: 3rem auto;
  padding: 2.25rem 2rem;
  border-radius: 16px;
  text-align: center;
  background: light-dark(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.03));
  border: 1px solid light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.08));

  @media (max-width: 768px) {
    margin: 1.5rem auto;
    padding: 1.75rem 1.25rem;
  }
`

const IconCircle = styled.span<{ $tone: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  color: ${({ $tone }) => $tone};
  background: color-mix(in srgb, ${({ $tone }) => $tone} 14%, transparent);
`

const Title = styled.h2`
  margin: 0.25rem 0 0;
  font-size: 1.3rem;
  font-weight: 700;
`

const Message = styled.p`
  margin: 0;
  line-height: 1.55;
  opacity: 0.75;
`

// The raw error, for when the friendly message is a generic one.
const Details = styled.code`
  max-width: 100%;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  opacity: 0.6;
  overflow-wrap: anywhere;
  background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.05));
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.5rem;
`

const action = `
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.4rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
`

const RetryButton = styled.button`
  ${action}
  border: none;
  background: var(--brand-fill);
  color: var(--on-brand);

  &:hover,
  &:focus-visible {
    background: var(--brand-fill-hover);
  }
`

// A styled wrapper rather than styled(Link), which would lose the
// router's typing of `to` and `search`.
const SecondaryAction = styled.span`
  a {
    ${action}
    color: inherit;
    border: 1px solid light-dark(rgba(0, 0, 0, 0.14), rgba(255, 255, 255, 0.14));
  }

  a:hover,
  a:focus-visible {
    background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.06));
  }
`

export interface ErrorDescription {
  icon: IconType
  title: string
  message: string
  // Shown when the message doesn't already say what happened.
  details?: string
  // Retrying won't find a player who doesn't exist.
  retryable: boolean
}

export function describeError(error: unknown): ErrorDescription {
  const text = error instanceof Error ? error.message : String(error)

  if (/not found/i.test(text)) {
    // "Player not found on Lichess!" -> "Lichess"
    const site = /on ([\w.]+)!?$/.exec(text)?.[1]
    return {
      icon: TbUserQuestion,
      title: 'Player not found',
      message: `There's no ${site ? `${site} ` : ''}player with that username. Check the spelling, or try the other platform.`,
      retryable: false,
    }
  }
  if (/rate limit/i.test(text)) {
    return {
      icon: TbAlertTriangle,
      title: 'Too many requests',
      message: text,
      retryable: true,
    }
  }
  // fetch() rejects with a TypeError when the request never got an answer.
  if (
    error instanceof TypeError &&
    /fetch|network|load failed/i.test(text)
  ) {
    return {
      icon: TbAlertTriangle,
      title: "Couldn't connect",
      message:
        "The chess site didn't answer. Check your connection and try again.",
      retryable: true,
    }
  }
  return {
    icon: TbAlertTriangle,
    title: 'Something went wrong',
    message: "This page couldn't load. It may be a hiccup on the chess site.",
    details: text,
    retryable: true,
  }
}

function PageError({
  error,
  onRetry,
}: {
  error: unknown
  // Defaults to re-running every failed query, which is what a page's own
  // error branch needs: they go back to loading and fetch again.
  onRetry?: () => void
}) {
  const queryClient = useQueryClient()
  const { icon: Icon, title, message, details, retryable } =
    describeError(error)

  function retry() {
    if (onRetry) return onRetry()
    queryClient.resetQueries({
      predicate: (query) => query.state.status === 'error',
    })
  }

  return (
    <Card role="alert">
      <IconCircle $tone={retryable ? '#f59e0b' : '#38bdf8'}>
        <Icon size={24} aria-hidden />
      </IconCircle>
      <Title>{title}</Title>
      <Message>{message}</Message>
      {details && <Details>{details}</Details>}
      <Actions>
        {retryable && (
          <RetryButton type="button" onClick={retry}>
            <TbRefresh size={16} aria-hidden />
            Try again
          </RetryButton>
        )}
        <SecondaryAction>
          <Link to="/" search={{ changeUsername: false }}>
            {retryable ? 'Back to search' : 'Search again'}
          </Link>
        </SecondaryAction>
      </Actions>
    </Card>
  )
}

// The router's error boundary: also clears failed queries, so a retry
// after a crash doesn't render straight back into the same cached error.
export function RouteError({ error, reset }: ErrorComponentProps) {
  const queryClient = useQueryClient()
  return (
    <PageError
      error={error}
      onRetry={() => {
        queryClient.resetQueries({
          predicate: (query) => query.state.status === 'error',
        })
        reset()
      }}
    />
  )
}

export default PageError
