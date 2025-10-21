import styled from 'styled-components'

const StatsBlock = styled.div`
  display: grid;
  gap: 0.2rem;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  align-items: center;
  width: 21rem;
  height: auto;
  border: 1.5px solid #666;
  border-radius: 20px;
  font-size: 22px;
  padding: 1rem;
  justify-items: center;
  background: rgba(255, 255, 255, 0.05);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.15);
  }

  svg {
    font-size: 1.25rem;
    color: rgba(0, 255, 255, 0.8);
    flex-shrink: 0;
  }
`

export default StatsBlock
