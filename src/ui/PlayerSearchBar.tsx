// The site's player search: one pill-shaped bar holding the platform
// switch, the username input and the submit button, with one outline and
// one focus glow around all three. Used on the home page and to add a
// favourite. Phones are too narrow for all three on a line, so there the
// switch sits above and the bar holds the other two.
import styled, { css } from 'styled-components'
import { useMediaQuery } from '@mantine/hooks'
import { PLATFORM_LABELS } from '../helpers/platform'
import Button from './Button'
import PlatformToggle from './PlatformToggle'
import UsernameAutocomplete from './UsernameAutocomplete'
import type { FormEventHandler } from 'react'
import type { Platform } from '../helpers/platform'

const bar = css`
  border-radius: 999px;
  padding: 0.3rem;
  border: 1.5px solid var(--brand-border);
  background: light-dark(rgba(255, 255, 255, 0.7), rgba(4, 18, 12, 0.55));
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;

  &:focus-within {
    border-color: var(--brand);
    box-shadow: 0 0 0 4px var(--brand-ring-faint);
  }
`

const SearchForm = styled.form`
  ${bar}
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
  max-width: 44rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.9rem;
    padding: 0;
    border: none;
    background: none;

    &:focus-within {
      box-shadow: none;
    }
  }
`

const ToggleSlot = styled.div`
  flex-shrink: 0;

  @media (max-width: 768px) {
    align-self: center;
  }
`

const Field = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  @media (max-width: 768px) {
    ${bar}
  }
`

const InputSlot = styled.div`
  flex: 1;
  min-width: 0;
`

const SubmitButton = styled(Button)`
  flex-shrink: 0;
  height: 2.75rem;
  padding: 0 1.6rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: none;

  /* Sits inside the bar, so it doesn't lift on hover. */
  &:hover,
  &:active {
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0 1.1rem;
  }
`

function PlayerSearchBar({
  platform,
  onPlatformChange,
  value,
  onChange,
  onBlur,
  name,
  submitLabel,
  submitting = false,
  onSubmit,
  placeholder,
}: {
  platform: Platform
  onPlatformChange: (platform: Platform) => void
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  submitLabel: string
  submitting?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  // For narrow spots, where "Chess.com username" would be cut off.
  placeholder?: string
}) {
  // The switch sits right above the bar on phones, so the placeholder can
  // drop the platform name (it doesn't fit there anyway).
  const isPhone = useMediaQuery('(max-width: 768px)')

  return (
    <SearchForm onSubmit={onSubmit}>
      <ToggleSlot>
        <PlatformToggle value={platform} onChange={onPlatformChange} embedded />
      </ToggleSlot>
      <Field>
        <InputSlot>
          <UsernameAutocomplete
            platform={platform}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            fullWidth
            bare
            placeholder={
              placeholder ??
              (isPhone ? 'Username' : `${PLATFORM_LABELS[platform]} username`)
            }
          />
        </InputSlot>
        <SubmitButton disabled={submitting}>{submitLabel}</SubmitButton>
      </Field>
    </SearchForm>
  )
}

export default PlayerSearchBar
