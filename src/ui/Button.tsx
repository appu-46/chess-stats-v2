import styled from 'styled-components'

const Button = styled.button`
  border: 1.3px solid #ddd;
  border-radius: 10rem;
  background: #1971c2;
  font-size: 28px;
  color: white;
  width: 10rem;
  height: 3.5rem;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: #1864a8;
    color: #eee;
  }
  &:active {
    opacity: 0.8;
    transform: translate(2px, 1px);
    background: #1864a8; /* Darker blue */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }
`

export default Button
