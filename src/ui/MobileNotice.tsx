import { useState } from 'react'
import styled from 'styled-components'
import { MdClose, MdInfoOutline } from 'react-icons/md'

const Banner = styled.div`
  /* Only surfaces on small screens; the app is desktop-first. */
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    text-align: center;
    padding: 0.5rem 2.25rem;
    font-size: 0.78rem;
    line-height: 1.3;
    background: var(--brand-fill);
    color: var(--on-brand);
  }
`

const CloseButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem;
  border: none;
  background: transparent;
  color: var(--on-brand);
  cursor: pointer;
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }
`

const STORAGE_KEY = 'mobileNoticeDismissed'

export default function MobileNotice() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true',
  )

  if (dismissed) return null

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  return (
    <Banner role="note">
      <MdInfoOutline size={16} />
      <span>For the best experience, view Chess Stats on a desktop or laptop.</span>
      <CloseButton onClick={handleDismiss} aria-label="Dismiss notice">
        <MdClose size={16} />
      </CloseButton>
    </Banner>
  )
}
