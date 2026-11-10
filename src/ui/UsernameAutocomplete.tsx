import { Autocomplete, Loader } from '@mantine/core'
import useLichessAutocomplete from '../hooks/useLichessAutocomplete'
import useChessComAutocomplete from '../hooks/useChessComAutocomplete'
import {
  MAX_SUGGESTIONS,
  getRecentPlayers,
  mergeSuggestions,
} from '../helpers/playerSuggestions'
import classes from '../css/UsernameAutocomplete.module.css'
import type { Platform } from '../helpers/platform'
import type { PlayerSuggestion } from '../helpers/playerSuggestions'

// Lichess suggestions come from its autocomplete endpoint. chess.com has
// none, so its list is put together from other sources (see
// helpers/playerSuggestions). Both also offer the players looked up before
// on this device, even before anything is typed.
function UsernameAutocomplete({
  platform,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  fullWidth,
  bare = false,
}: {
  platform: Platform
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  placeholder?: string
  // Fill the parent instead of the default 25rem.
  fullWidth?: boolean
  // No border or fill, for use inside a search bar that draws its own.
  bare?: boolean
}) {
  const lichess = useLichessAutocomplete(value, platform === 'lichess')
  const chessCom = useChessComAutocomplete(value, platform === 'chess.com')
  const isFetching = lichess.isFetching || chessCom.isFetching

  const needle = value.trim().toLowerCase()
  const suggestions: Array<PlayerSuggestion> =
    platform === 'chess.com'
      ? chessCom.suggestions
      : mergeSuggestions(value, {
          recent: getRecentPlayers('lichess'),
          // Lichess matched these by prefix, but for the debounced term:
          // drop the ones the latest keystroke has ruled out.
          cached: lichess.suggestions
            .filter((user) => user.name.toLowerCase().startsWith(needle))
            .map((user) => ({
              username: user.name,
              title: user.title,
              online: user.online,
            })),
        })

  const byName = new Map(suggestions.map((user) => [user.username, user]))

  return (
    <Autocomplete
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-label={`${platform === 'lichess' ? 'Lichess' : 'Chess.com'} username`}
      // Already matched and ordered; don't re-filter.
      data={suggestions.slice(0, MAX_SUGGESTIONS).map((user) => user.username)}
      filter={({ options }) => options}
      autoComplete="off"
      spellCheck={false}
      rightSection={isFetching ? <Loader size="xs" /> : null}
      // Bare inputs sit inside a bar: drop the list below its outline.
      comboboxProps={{ radius: 'md', shadow: 'md', offset: bare ? 12 : 8 }}
      classNames={{ dropdown: classes.dropdown, option: classes.option }}
      renderOption={({ option }) => {
        const user = byName.get(option.value)
        return (
          <span
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {user?.title && <span className={classes.title}>{user.title}</span>}
            {option.value}
            {user?.name && <span className={classes.name}>{user.name}</span>}
            {user?.recent && !user.online && (
              <span className={classes.recent}>Recent</span>
            )}
            {user?.online && (
              <span
                aria-label="online"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                }}
              />
            )}
          </span>
        )
      }}
      styles={{
        root: { width: fullWidth ? '100%' : '25rem', maxWidth: '100%' },
        input: bare
          ? {
              height: '2.75rem',
              border: 'none',
              paddingLeft: '0.75rem',
              background: 'transparent',
              color: 'inherit',
              fontSize: '1rem',
            }
          : {
              height: '3rem',
              borderRadius: '1rem',
              border: '1.5px solid var(--brand)',
              paddingLeft: '2rem',
              background: 'transparent',
              color: 'inherit',
              fontSize: '1rem',
            },
      }}
    />
  )
}

export default UsernameAutocomplete
