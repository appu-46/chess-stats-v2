// The top 100 players on either site in one time control, with how many
// each country has among them. Filter by country (pick one in the list or
// the menu) and by title. Everything is in the URL, so a view can be
// shared.
import styled from 'styled-components'
import { useEffect, useId, useRef } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { SegmentedControl, Select } from '@mantine/core'
import { TbTrophy, TbX } from 'react-icons/tb'
import useLeaderboard from '../hooks/useLeaderboard'
import { leaderboardControls } from '../services/apiLeaderboard'
import { summarizeLeaderboard } from '../helpers/leaderboard'
import { NO_COUNTRY, NO_TITLE } from '../helpers/leaderboardSearch'
import {
  PLATFORM_LABELS,
  parsePlatform,
  platformSearch,
} from '../helpers/platform'
import { PageEyebrow } from '../ui/PageHeader'
import PlatformToggle, { brandToggleStyles } from '../ui/PlatformToggle'
import PageError from '../ui/PageError'
import { Pulse } from '../ui/DashboardSkeleton'
import CountryFlag from '../ui/CountryFlag'
import dropdownClasses from '../css/UsernameAutocomplete.module.css'
import type { LeaderboardSearch } from '../helpers/leaderboardSearch'
import type { Country } from '../helpers/normalizePlayer'
import type { Platform } from '../helpers/platform'

// The platform switch's green look, a size down (as on Compare).
const toggleStyles = {
  ...brandToggleStyles,
  root: { ...brandToggleStyles.root, padding: 3 },
  label: { fontWeight: 600, padding: '0.2rem 0.8rem' },
}

// The filters match the platform switch beside them (a mint outline, no
// fill) instead of Mantine's grey, and their lists the username
// suggestions' green dropdown.
const selectStyles = {
  input: {
    background: 'transparent',
    border: '1.5px solid var(--brand-border)',
    color: 'inherit',
  },
}
const selectClassNames = {
  dropdown: dropdownClasses.dropdown,
  option: dropdownClasses.option,
}

// ── Layout ──────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.5rem 2rem 1.5rem;

  @media (max-width: 768px) {
    padding: 0.5rem 0;
    gap: 1rem;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  & > :first-child {
    margin-bottom: 0.25rem;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const Subtitle = styled.p`
  margin: 0;
  opacity: 0.6;
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
`

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-left: auto;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;

    & > * {
      flex: 1 1 10rem;
    }
  }
`

// On phones the time controls scroll sideways rather than wrapping.
const TabScroll = styled.div`
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(15rem, 19rem) minmax(0, 1fr);
  align-items: start;
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const Panel = styled.section`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.1rem 1.25rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const PanelTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
`

const SectionHeading = styled.h2`
  margin: 0;
  font-size: 0.75rem !important;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

const Muted = styled.span`
  font-size: 0.82rem;
  opacity: 0.6;
`

const ClearButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: light-dark(var(--brand), var(--brand-soft));
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`

const Note = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  opacity: 0.65;
`

// ── Countries ───────────────────────────────────────────────────────

const CountryList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: 34rem;
  overflow-y: auto;
  scrollbar-width: thin;

  @media (max-width: 1024px) {
    max-height: 15rem;
  }
`

const CountryButton = styled.button<{ $share: number }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: none;
  border-radius: 9px;
  overflow: hidden;
  background: none;
  color: inherit;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;

  /* A bar behind the row, as wide as the country's share of the leader. */
  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: ${({ $share }) => $share * 100}%;
    background: light-dark(rgba(52, 163, 126, 0.1), rgba(110, 231, 183, 0.07));
    z-index: -1;
  }

  &:hover,
  &:focus-visible {
    background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.05));
  }

  /* The filtered country: the same solid green as the selected
     platform and time control, without its share bar. */
  &[aria-pressed='true'] {
    background: var(--brand-fill);
    box-shadow: 0 2px 10px var(--brand-glow);
    font-weight: 700;

    &::before {
      display: none;
    }

    &,
    & span {
      color: var(--on-brand);
    }
  }

  &[aria-pressed='true']:hover,
  &[aria-pressed='true']:focus-visible {
    background: var(--brand-fill-hover);
  }

  isolation: isolate;
`

const CountryName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Count = styled.span`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`

// ── Players ─────────────────────────────────────────────────────────

const columns = `
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) minmax(0, 12rem) 4.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 2.25rem minmax(0, 1fr) 4rem;

    & > [data-column='country'] {
      display: none;
    }
  }
`

const HeaderRow = styled.div`
  ${columns}
  padding-top: 0;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;

  & > :last-child {
    text-align: right;
  }
`

const PlayerList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

// A styled wrapper rather than styled(Link), which would lose the
// router's typing of `params` and `search`.
// Gold, silver and bronze for the top three: a medal in place of the
// number, and a faint wash of the same colour across the row.
const MEDALS: Partial<
  Record<
    number,
    {
      label: string
      // Medallion gradient, light to dark, and the number's colour.
      light: string
      mid: string
      dark: string
      ink: string
      // The two halves of the ribbon.
      ribbon: [string, string]
      tint: string
    }
  >
> = {
  1: {
    label: 'Gold',
    light: '#fff3b0',
    mid: '#f5b301',
    dark: '#a86f00',
    ink: '#4a3200',
    ribbon: ['#d63b3b', '#2f6fd6'],
    tint: '#f5b301',
  },
  2: {
    label: 'Silver',
    light: '#ffffff',
    mid: '#c2c8d0',
    dark: '#7c8591',
    ink: '#2b3036',
    ribbon: ['#2f6fd6', '#d63b3b'],
    tint: '#aeb6c1',
  },
  3: {
    label: 'Bronze',
    light: '#ffd9b3',
    mid: '#cd7f32',
    dark: '#86501c',
    ink: '#3d1f05',
    ribbon: ['#2f9e57', '#d63b3b'],
    tint: '#cd7f32',
  },
}

const PlayerRow = styled.li<{ $tint?: string }>`
  a {
    ${columns}
    border-radius: 10px;
    color: inherit;
    text-decoration: none;
    background: ${({ $tint }) =>
      $tint ? `color-mix(in srgb, ${$tint} 9%, transparent)` : 'none'};
    box-shadow: ${({ $tint }) => ($tint ? `inset 3px 0 0 ${$tint}` : 'none')};
  }

  a:hover,
  a:focus-visible {
    background: ${({ $tint }) =>
      $tint
        ? `color-mix(in srgb, ${$tint} 15%, transparent)`
        : 'light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.05))'};
  }
`

const Rank = styled.span`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
`

const MedalSvg = styled.svg`
  display: block;
  overflow: visible;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
`

const PlayerCell = styled.span`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
`

const Avatar = styled.img`
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
`

const AvatarFallback = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  background: rgba(127, 127, 127, 0.15);
`

const NameBlock = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const NameLine = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  font-weight: 600;

  & > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const ChessTitle = styled.span`
  flex-shrink: 0;
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  background: #7d2828;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;

  && {
    color: white;
  }
`

const Handle = styled.span`
  font-size: 0.78rem;
  opacity: 0.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CountryCell = styled.span`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.85rem;
  opacity: 0.8;

  & > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const RatingCell = styled.span`
  text-align: right;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`

const Empty = styled.p`
  margin: 0;
  padding: 1.5rem 0.75rem;
  opacity: 0.6;
`

// A medal on a crossed ribbon, with the rank on the medallion.
function Medal({ rank }: { rank: number }) {
  const id = useId()
  const medal = MEDALS[rank]
  if (!medal) return <Rank>{rank}</Rank>
  // useId's colons would break the url(#...) reference.
  const gradient = `medal-${id.replace(/[^\w-]/g, '')}`
  return (
    <MedalSvg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      role="img"
      aria-label={`Rank ${rank}, ${medal.label.toLowerCase()}`}
    >
      <title>{`${medal.label}: rank ${rank}`}</title>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={medal.light} />
          <stop offset="0.55" stopColor={medal.mid} />
          <stop offset="1" stopColor={medal.dark} />
        </linearGradient>
      </defs>
      <polygon points="4,0 11,0 17,15 10,15" fill={medal.ribbon[0]} />
      <polygon points="17,0 24,0 18,15 11,15" fill={medal.ribbon[1]} />
      <circle
        cx="14"
        cy="24"
        r="11"
        fill={`url(#${gradient})`}
        stroke={medal.dark}
        strokeWidth="1"
      />
      <circle
        cx="14"
        cy="24"
        r="8"
        fill="none"
        stroke={medal.light}
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="14"
        y="28"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill={medal.ink}
      >
        {rank}
      </text>
    </MedalSvg>
  )
}

function countryLabel(key: string, country: Country | null) {
  return key === NO_COUNTRY ? 'No country set' : (country?.name ?? key)
}

// ── Page ────────────────────────────────────────────────────────────

function Leaderboard() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/leaderboard' })
  const platform: Platform = parsePlatform(search.platform)
  const controls = leaderboardControls(platform)
  const control =
    controls.find(({ timeClass }) => timeClass === search.tc) ?? controls[0]

  const { data, isPending, error } = useLeaderboard(platform, control.timeClass)

  // A country picked from the menu may sit far down the list: scroll the
  // list (not the page) to show it.
  const countryListRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const list = countryListRef.current
    const selected = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!list || !selected) return
    const top = selected.offsetTop - list.offsetTop
    if (
      top < list.scrollTop ||
      top + selected.offsetHeight > list.scrollTop + list.clientHeight
    ) {
      list.scrollTo({ top: top - list.clientHeight / 2, behavior: 'smooth' })
    }
  }, [search.country, data])

  function update(next: LeaderboardSearch) {
    navigate({
      to: '/leaderboard',
      search: { ...search, ...next },
      replace: true,
      // Same page, new filters: keep the scroll position.
      resetScroll: false,
    })
  }

  const summary = data
    ? summarizeLeaderboard(data.entries, {
        country: search.country,
        title: search.title,
      })
    : null
  // A filter that matches nothing on this board (after switching site or
  // time control) still shows, so it can be seen and cleared.
  const filtered = !!search.country || !!search.title
  const topCount = summary?.countries[0]?.count ?? 1
  const total = data?.entries.length ?? 0

  return (
    <PageWrapper>
      <Header>
        <PageEyebrow icon={TbTrophy} section="Leaderboard" />
        <Title>Top 100 players</Title>
        <Subtitle>
          The highest-rated players on Chess.com and Lichess right now, by
          country and title.
        </Subtitle>
      </Header>

      <Controls>
        <PlatformToggle
          value={platform}
          onChange={(next) =>
            // Countries and titles carry over; time controls differ by site.
            update({
              platform: next === 'lichess' ? 'lichess' : undefined,
              tc: undefined,
            })
          }
        />
        <TabScroll>
          <SegmentedControl
            size="sm"
            radius="xl"
            color="transparent"
            styles={toggleStyles}
            classNames={{ label: 'platform-toggle-label' }}
            value={control.timeClass}
            onChange={(tc) => update({ tc })}
            data={controls.map(({ timeClass, label }) => ({
              value: timeClass,
              label,
            }))}
            aria-label="Time control"
          />
        </TabScroll>
        <Filters>
          <Select
            aria-label="Country"
            placeholder="All countries"
            searchable
            clearable
            nothingFoundMessage="No country on this board"
            value={search.country ?? null}
            onChange={(country) => update({ country: country ?? undefined })}
            data={(summary?.countries ?? []).map(({ key, country, count }) => ({
              value: key,
              label: `${countryLabel(key, country)} (${count})`,
            }))}
            radius="xl"
            w={{ base: '100%', sm: 220 }}
            comboboxProps={{ radius: 'md', shadow: 'md' }}
            styles={selectStyles}
            classNames={selectClassNames}
          />
          <Select
            aria-label="Title"
            placeholder="All titles"
            clearable
            value={search.title ?? null}
            onChange={(title) => update({ title: title ?? undefined })}
            data={(summary?.titles ?? []).map(({ title, count }) => ({
              value: title,
              label: `${title === NO_TITLE ? 'No title' : title} (${count})`,
            }))}
            radius="xl"
            w={{ base: '100%', sm: 160 }}
            comboboxProps={{ radius: 'md', shadow: 'md' }}
            styles={selectStyles}
            classNames={selectClassNames}
          />
        </Filters>
      </Controls>

      {error ? (
        <PageError error={error} />
      ) : (
        <Columns>
          <Panel aria-label="Countries">
            <PanelTop>
              <SectionHeading>Countries</SectionHeading>
              {search.country ? (
                <ClearButton
                  type="button"
                  onClick={() => update({ country: undefined })}
                >
                  Show all
                </ClearButton>
              ) : (
                summary && <Muted>{summary.countries.length}</Muted>
              )}
            </PanelTop>
            {isPending || !summary ? (
              <CountryList>
                {Array.from({ length: 8 }, (_, i) => (
                  <li key={i}>
                    <Pulse $h="1.9rem" $radius="9px" />
                  </li>
                ))}
              </CountryList>
            ) : (
              <CountryList ref={countryListRef}>
                {summary.countries.map(({ key, country, count }) => (
                  <li key={key}>
                    <CountryButton
                      type="button"
                      $share={count / topCount}
                      aria-pressed={search.country === key}
                      onClick={() =>
                        update({
                          country: search.country === key ? undefined : key,
                        })
                      }
                    >
                      <CountryFlag
                        country={key === NO_COUNTRY ? null : country}
                      />
                      <CountryName>{countryLabel(key, country)}</CountryName>
                      <Count>{count}</Count>
                      {search.country === key && <TbX size={14} aria-hidden />}
                    </CountryButton>
                  </li>
                ))}
              </CountryList>
            )}
          </Panel>

          <Panel aria-label="Players">
            <PanelTop>
              <SectionHeading>
                {control.label} · {PLATFORM_LABELS[platform]}
              </SectionHeading>
              {summary &&
                (filtered ? (
                  <ClearButton
                    type="button"
                    onClick={() =>
                      update({ country: undefined, title: undefined })
                    }
                  >
                    {summary.players.length} of {total} · Clear filters
                  </ClearButton>
                ) : (
                  <Muted>{total} players</Muted>
                ))}
            </PanelTop>

            {data?.partial && (
              <Note>
                Chess.com's ranks 51–100 couldn't be loaded right now, so this
                is the top 50.
              </Note>
            )}
            {platform === 'lichess' && !isPending && (
              <Note>
                Setting a country is optional on Lichess, so many top players
                show none.
              </Note>
            )}

            <HeaderRow aria-hidden>
              <span>#</span>
              <span>Player</span>
              <span data-column="country">Country</span>
              <span>Rating</span>
            </HeaderRow>

            {isPending || !summary ? (
              <PlayerList>
                {Array.from({ length: 10 }, (_, i) => (
                  <li key={i}>
                    <Pulse $h="2.9rem" $radius="10px" />
                  </li>
                ))}
              </PlayerList>
            ) : summary.players.length === 0 ? (
              <Empty>No players match these filters on this board.</Empty>
            ) : (
              <PlayerList>
                {summary.players.map((entry) => (
                  <PlayerRow
                    key={entry.username}
                    $tint={MEDALS[entry.rank]?.tint}
                  >
                    <Link
                      to="/profile/$username"
                      params={{ username: entry.username }}
                      search={platformSearch(platform)}
                    >
                      <Medal rank={entry.rank} />
                      <PlayerCell>
                        {entry.avatar ? (
                          <Avatar src={entry.avatar} alt="" loading="lazy" />
                        ) : (
                          <AvatarFallback aria-hidden>
                            {entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                        <NameBlock>
                          <NameLine>
                            {entry.title && (
                              <ChessTitle>{entry.title}</ChessTitle>
                            )}
                            <span>{entry.name || entry.username}</span>
                          </NameLine>
                          {entry.name && <Handle>@{entry.username}</Handle>}
                        </NameBlock>
                      </PlayerCell>
                      <CountryCell data-column="country">
                        <CountryFlag country={entry.country} />
                        <span>{entry.country?.name ?? '—'}</span>
                      </CountryCell>
                      <RatingCell>{entry.rating}</RatingCell>
                    </Link>
                  </PlayerRow>
                ))}
              </PlayerList>
            )}
          </Panel>
        </Columns>
      )}
    </PageWrapper>
  )
}

export default Leaderboard
