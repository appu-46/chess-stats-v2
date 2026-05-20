import styled from 'styled-components'
import { FcGoogle } from 'react-icons/fc'

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  height: 3.5rem;
  padding: 0 1.5rem;
  border-radius: 10rem;

  background: #ffffff;
  color: #222;

  border: 1px solid #dadce0;
  font-size: 16px;
  font-weight: 500;

  cursor: pointer;

  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.15);

  [data-mantine-color-scheme='light'] & {
    color: #eee;
    background: rgba(25, 25, 25, 0.85);
    border: 1px solid #dadce0;
  }

  &:hover {
    background: transparent 0.8;
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(1px);
  }
`

type Props = {
  onClick: () => void
}

function GoogleOAuthButton({ onClick }: Props) {
  return (
    <GoogleButton onClick={onClick}>
      <FcGoogle size={22} />
      <>Sign in with Google</>
    </GoogleButton>
  )
}

export default GoogleOAuthButton
