// The header shared by the player pages: a small "<icon> SECTION" eyebrow
// naming the page, then whose data it is (avatar, title, name, handle,
// platform), with an optional subtitle and a slot on the right for the
// page's own controls or summary.
import styled from 'styled-components'
import PlatformBadge from './PlatformBadge'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import type { PlayerProfile } from '../helpers/normalizePlayer'
import type { Platform } from '../helpers/platform'

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem 2rem;
`

const Identity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
`

const EyebrowLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  svg {
    color: light-dark(var(--brand), var(--brand-soft));
  }

  span {
    opacity: 0.6;
  }
`

const Player = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
`

const Avatar = styled.img`
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 1.5px var(--brand-border-soft);
`

const AvatarFallback = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--brand-fill);
  color: var(--on-brand);
  font-weight: 700;
  font-size: 1.1rem;
`

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`

const NameLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`

const ChessTitle = styled.span`
  flex-shrink: 0;
  padding: 0.15rem 0.4rem;
  border-radius: 5px;
  background: #7d2828;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;

  && {
    color: white;
  }
`

const Name = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
  font-size: 0.88rem;

  & > span {
    opacity: 0.65;
  }

  /* Phones: the subtitle gets its own line, without a dangling "·". */
  @media (max-width: 768px) {
    & > [data-separator] {
      display: none;
    }

    & > [data-subtitle] {
      flex-basis: 100%;
    }
  }
`

// May shrink to the screen width, so a summary inside can wrap on phones.
const Aside = styled.div`
  min-width: 0;
  max-width: 100%;
`

// Just the "<icon> SECTION" line, for pages whose own content already shows
// the player (the profile's identity card).
export function PageEyebrow({
  icon: Icon,
  section,
}: {
  icon: IconType
  section: string
}) {
  return (
    <EyebrowLine>
      <Icon size={13} aria-hidden />
      <span>{section}</span>
    </EyebrowLine>
  )
}

function PageHeader({
  icon,
  section,
  username,
  platform,
  profile,
  subtitle,
  aside,
}: {
  icon: IconType
  section: string
  username: string
  platform: Platform
  profile?: PlayerProfile | null
  subtitle?: ReactNode
  // Right-hand slot: the page's controls or summary.
  aside?: ReactNode
}) {
  const handle = profile?.username ?? username
  const name = profile?.name || handle

  return (
    <Header>
      <Identity>
        <PageEyebrow icon={icon} section={section} />
        <Player>
          {profile?.avatar ? (
            <Avatar src={profile.avatar} alt="" />
          ) : (
            <AvatarFallback aria-hidden>
              {handle.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
          <NameBlock>
            <NameLine>
              {profile?.title && <ChessTitle>{profile.title}</ChessTitle>}
              <Name>{name}</Name>
            </NameLine>
            <Meta>
              {/* Without a real name the handle is already the title. */}
              {profile?.name && <span>@{handle}</span>}
              <PlatformBadge platform={platform} />
              {subtitle && (
                <>
                  <span aria-hidden data-separator>
                    ·
                  </span>
                  <span data-subtitle>{subtitle}</span>
                </>
              )}
            </Meta>
          </NameBlock>
        </Player>
      </Identity>
      {aside && <Aside>{aside}</Aside>}
    </Header>
  )
}

export default PageHeader
