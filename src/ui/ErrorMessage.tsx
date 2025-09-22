import styled from 'styled-components'

const StyledErrorMessage = styled.span`
  color: red;
  font-size: 16px;
`
interface Inputprops {
  message: string
}

function ErrorMessage({ message }: Inputprops) {
  return <StyledErrorMessage>{message}</StyledErrorMessage>
}

export default ErrorMessage
