import styled from 'styled-components'

const StatsBlock = styled.div`
  display: grid;
  gap: 0.2rem;
  grid-template-columns: 7rem auto auto auto auto;
  grid-template-rows: 5rem 2fr;
  align-items: center;
  width: 21.5rem;
  height: 21.5rem;
  border: 1.5px solid #444;
  border-radius: 20px;
  background-color: #eee;
  font-size: 22px;
  padding: 1rem;
  justify-items: start;
`

export default StatsBlock
