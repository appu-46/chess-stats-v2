import styled from 'styled-components'

const StatsBlock = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  opacity: 0.9;
  &:hover {
    transform: translateY(-6px);
  }
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
  [data-mantine-color-scheme='light'] & {
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

export default StatsBlock
