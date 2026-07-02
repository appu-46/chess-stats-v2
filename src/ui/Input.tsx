import styled from 'styled-components'

const Input = styled.input`
  border-radius: 10rem;
  border-color: grey;
  border: 2px solid gray;
  width: 25rem;
  max-width: 100%;
  height: 3rem;
  padding: 0rem 0rem 0rem 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
  }
`

export default Input
