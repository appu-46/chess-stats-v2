import styled from 'styled-components'

const StatsBlock = styled.div`
  display: grid;
  gap: 0.2rem;
  grid-template-areas:
    'pie pie'
    'rapidraing'
    'best' 'rating'
    'latest' 'rating';
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  align-items: center;
  width: auto;
  height: auto;
  border: 1.5px solid #666;
  border-radius: 20px;
  font-size: 22px;
  padding: 1rem;
  justify-items: center;
  background: rgba(255, 255, 255, 0.05);

  > rapidrating {
    grid-area: h1;
  }

  > best,
  rating {
    grid-area: div;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.25rem;
    color: rgba(0, 255, 255, 0.8);
    flex-shrink: 0;
  }
`

export default StatsBlock
