import { Autocomplete, Loader } from '@mantine/core'
import { useMemo } from 'react'
import useLichessAutocomplete from '../hooks/useLichessAutocomplete'
import classes from '../css/UsernameAutocomplete.module.css'
import type { Platform } from '../helpers/platform'

const MAX_SUGGESTIONS = 10

// Suggestions are lichess-only: chess.com has no documented search or
// autocomplete endpoint, so for chess.com this is a plain text input with
// the same look.
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
  const { suggestions, isFetching } = useLichessAutocomplete(
    value,
    platform === 'lichess',
  )

  const byName = useMemo(
    () => new Map(suggestions.map((user) => [user.name, user])),
    [suggestions],
  )

  return (
    <Autocomplete
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-label={`${platform === 'lichess' ? 'Lichess' : 'Chess.com'} username`}
      // Lichess already filtered by prefix server-side; don't re-filter.
      data={suggestions.slice(0, MAX_SUGGESTIONS).map((user) => user.name)}
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
            {user?.title && (
              <span className={classes.title}>{user.title}</span>
            )}
            {option.value}
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
