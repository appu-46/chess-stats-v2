import styled from 'styled-components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import type { ReactNode } from 'react'

// A single row of stat cards that scrolls sideways instead of wrapping into
// a tall grid. Edges fade only on the side that has more cards; arrow
// buttons in the header page through on pointer devices (touch users swipe).

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
`

const Heading = styled.h3`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
`

const Arrows = styled.div`
  display: flex;
  gap: 0.4rem;

  @media (hover: none) {
    display: none;
  }
`

const ArrowButton = styled.button`
  width: 1.85rem;
  height: 1.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(187, 247, 208, 0.48);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }

  [data-mantine-color-scheme='light'] & {
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.6);

    &:hover:not(:disabled) {
      border-color: rgba(20, 83, 45, 0.48);
    }
  }
`

const Track = styled.div<{ $fadeLeft: boolean; $fadeRight: boolean }>`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scroll-padding-inline: 0.25rem;
  overscroll-behavior-x: contain;
  /* Room for the hover lift and focus ring, which overflow would clip. */
  padding: 0.35rem 0.25rem;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  ${({ $fadeLeft, $fadeRight }) => {
    if (!$fadeLeft && !$fadeRight) return ''
    const left = $fadeLeft ? 'transparent 0, #000 3rem' : '#000 0'
    const right = $fadeRight
      ? '#000 calc(100% - 3rem), transparent 100%'
      : '#000 100%'
    const mask = `linear-gradient(to right, ${left}, ${right})`
    return `-webkit-mask-image: ${mask}; mask-image: ${mask};`
  }}
`

// ── Card ────────────────────────────────────────────────────────────

const Card = styled.div<{ $accent: string }>`
  flex: 0 0 auto;
  min-width: 11rem;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.95rem 1.1rem 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(
      in srgb,
      ${({ $accent }) => $accent} 45%,
      transparent
    );
  }

  @media (max-width: 768px) {
    min-width: 9.75rem;
    padding: 0.85rem 0.95rem 0.75rem;
  }

  [data-mantine-color-scheme='light'] & {
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: color-mix(
        in srgb,
        ${({ $accent }) => $accent} 55%,
        transparent
      );
    }
  }
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
`

const IconBadge = styled.span<{ $accent: string }>`
  flex-shrink: 0;
  width: 1.7rem;
  height: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: ${({ $accent }) => $accent};
  background: color-mix(in srgb, ${({ $accent }) => $accent} 16%, transparent);
`

const Label = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0.6;
`

const Value = styled.div`
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`

// Always rendered so every card is the same height and values line up,
// whether or not the stat has a sub-line.
const Sub = styled.div`
  min-height: 1rem;
  font-size: 0.72rem;
  line-height: 1rem;
  opacity: 0.5;
  white-space: nowrap;
`

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
  valueColor,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  sub?: ReactNode
  accent: string
  valueColor?: string
}) {
  return (
    <Card $accent={accent}>
      <CardTop>
        <IconBadge $accent={accent}>{icon}</IconBadge>
        <Label>{label}</Label>
      </CardTop>
      <Value style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </Value>
      <Sub>{sub}</Sub>
    </Card>
  )
}

// ── Carousel ────────────────────────────────────────────────────────

function StatCarousel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    // 1px slack: fractional widths can leave scrollLeft just short of max.
    const maxScroll = track.scrollWidth - track.clientWidth - 1
    setCanScrollLeft(track.scrollLeft > 1)
    setCanScrollRight(track.scrollLeft < maxScroll)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateScrollState()
    // Re-check when the track or its cards change size (window resize,
    // values animating to wider numbers).
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(track)
    for (const child of Array.from(track.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [updateScrollState])

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: 'smooth',
    })
  }

  const isScrollable = canScrollLeft || canScrollRight

  return (
    <Section>
      <Header>
        <Heading>{title}</Heading>
        {isScrollable && (
          <Arrows>
            <ArrowButton
              aria-label={`Scroll ${title} left`}
              disabled={!canScrollLeft}
              onClick={() => scrollByPage(-1)}
            >
              <FaChevronLeft size={11} />
            </ArrowButton>
            <ArrowButton
              aria-label={`Scroll ${title} right`}
              disabled={!canScrollRight}
              onClick={() => scrollByPage(1)}
            >
              <FaChevronRight size={11} />
            </ArrowButton>
          </Arrows>
        )}
      </Header>
      <Track
        ref={trackRef}
        role="region"
        aria-label={title}
        tabIndex={0}
        onScroll={updateScrollState}
        $fadeLeft={canScrollLeft}
        $fadeRight={canScrollRight}
      >
        {children}
      </Track>
    </Section>
  )
}

export default StatCarousel
