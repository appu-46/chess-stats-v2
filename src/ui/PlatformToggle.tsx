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

function PlatformToggle({
  value,
  onChange,
}: {
  value: Platform
  onChange: (platform: Platform) => void
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
      styles={styles}
      classNames={{ label: 'platform-toggle-label' }}
    />
  )
}

export default PlatformToggle
