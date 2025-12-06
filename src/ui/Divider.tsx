import styled from 'styled-components'

const HorizontalDivider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  color: #888;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #888;
    margin: 0 1rem;
  }
`
export default HorizontalDivider
