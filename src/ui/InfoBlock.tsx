import styled from 'styled-components'

const InfoBlock = styled.div`
  display: flex;
  align-items: center;
  min-width: 19.5rem;
  gap: 0.75rem;
  height: 5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.2s ease;

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

export default InfoBlock
