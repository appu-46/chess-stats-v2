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
  color: #333;

  border: 1px solid #dadce0;
  font-size: 16px;
  font-weight: 500;

  cursor: pointer;

  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.15);

  transition:
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #f8f9fa;
    color: #333;
    transform: translateY(-2px);
  }

  &:active {
    background: #f1f3f4;
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
