import styled from 'styled-components'

interface InputProps {
  type: string
  placeholder: string
  id: string
}

const StyledInput = styled.input`
  border-radius: 10rem;
  border-color: grey;
  border: 2px solid gray;
  width: 25rem;
  height: 3rem;
  padding: 20px;
`

function Input({ type, placeholder, id }: InputProps) {
  return <StyledInput type={type} id={id} placeholder={placeholder} />
}

export default Input
