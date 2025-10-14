import styled from 'styled-components'

const PlayerAvatar = styled.img`
  grid-row: 1/4;
  grid-column: 1;
  height: 13.5rem;
  // width: 10rem;
  border-radius: 2.5rem;
  border: 1.5px solid aqua;

  svg {
    font-size: 1.25rem;
    color: rgba(0, 255, 255, 0.8);
    flex-shrink: 0;
  }
`

export default PlayerAvatar
