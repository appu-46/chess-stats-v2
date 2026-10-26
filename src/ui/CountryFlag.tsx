import styled from 'styled-components'
import { useState } from 'react'
import { FaGlobe } from 'react-icons/fa'
import { flagSrc } from '../helpers/flags'
import type { Country } from '../helpers/normalizePlayer'

const FlagImg = styled.img<{ $size: number }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => Math.round(($size * 3) / 4)}px;
  object-fit: cover;
  border-radius: 2px;
`

const Globe = styled.span<{ $size: number }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  opacity: 0.7;
`

// A country's flag, or a globe for "International", no country, or a flag
// that fails to load (rather than the browser's broken-image box).
function CountryFlag({
  country,
  size = 20,
}: {
  country: Country | null
  size?: number
}) {
  const src = country ? flagSrc(country) : null
  const [failed, setFailed] = useState<string | null>(null)

  if (!src || failed === src) {
    return (
      <Globe $size={size} aria-hidden>
        <FaGlobe size={Math.round(size * 0.7)} />
      </Globe>
    )
  }
  return (
    <FlagImg
      $size={size}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(src)}
    />
  )
}

export default CountryFlag
