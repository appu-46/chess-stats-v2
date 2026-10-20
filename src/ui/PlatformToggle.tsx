import { SegmentedControl } from '@mantine/core'
import { PLATFORMS, PLATFORM_LABELS, parsePlatform } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

// Styled with the site's brand tokens (see styles/GlobalStyle) instead of
// Mantine's default greys: a mint-outlined track, and the selected option
// in the same green fill as the primary buttons.
const styles = {
  root: {
    background: 'transparent',
    border: '1.5px solid var(--brand-border)',
    padding: 4,
  },
  indicator: {
    background: 'var(--brand-fill)',
    boxShadow: '0 2px 10px var(--brand-glow)',
  },
  label: {
    fontWeight: 600,
    padding: '0.35rem 1.1rem',
  },
}

// Inside a search bar that already draws the outline: no border of its
// own, just a faint tinted track.
const embeddedStyles = {
  ...styles,
  root: {
    background:
      'light-dark(rgba(52, 163, 126, 0.08), rgba(110, 231, 183, 0.06))',
    border: 'none',
    padding: 3,
  },
}

function PlatformToggle({
  value,
  onChange,
  embedded = false,
}: {
  value: Platform
  onChange: (platform: Platform) => void
  embedded?: boolean
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={(next) => onChange(parsePlatform(next))}
      data={PLATFORMS.map((platform) => ({
        value: platform,
        label: PLATFORM_LABELS[platform],
      }))}
      radius="xl"
      size="md"
      aria-label="Chess platform"
      // The active label sits on the green fill; inactive ones inherit the
      // page's text colour so they work in both themes.
      color="transparent"
      styles={embedded ? embeddedStyles : styles}
      classNames={{ label: 'platform-toggle-label' }}
    />
  )
}

export default PlatformToggle
