import styled from 'styled-components'
import { TbAlertCircle } from 'react-icons/tb'

// A form's "this didn't work" line (an empty username, a player who
// couldn't be added): the app's loss red, a shade deeper in light mode to
// stay readable, at the size of the text around it.
const StyledErrorMessage = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: light-dark(#dc2626, #f87171);

  svg {
    flex-shrink: 0;
  }
`
interface Inputprops {
  message: string
}

function ErrorMessage({ message }: Inputprops) {
  return (
    <StyledErrorMessage role="alert">
      <TbAlertCircle size={15} aria-hidden />
      {message}
    </StyledErrorMessage>
  )
}

export default ErrorMessage
