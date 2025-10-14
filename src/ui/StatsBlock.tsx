import styled from 'styled-components'

const StatsBlock = styled.div`
  display: grid;
  gap: 0.2rem;
  grid-template-columns: 7rem auto auto auto auto;
  grid-template-rows: 5rem 2fr;
  align-items: center;
  width: 21.5rem;
  height: 21.5rem;
  border: 1.5px solid #666;
  border-radius: 20px;
  font-size: 22px;
  padding: 1rem;
  justify-items: start;
  background: rgba(255, 255, 255, 0.05);

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
