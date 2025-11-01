import styled from 'styled-components'

const Button = styled.button`
  border: 1.3px solid #ddd;
  border-radius: 10rem;
  background: #1971c2;
  font-size: 28px;
  color: white;
  padding: 0rem 1.5rem 0rem 1.5rem;
  width: fit-content;
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
    transform: translateY(-2px);
  }
  &:active {
    opacity: 0.8;
    transform: translate(2px, 1px);
    background: #1864a8;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #a5a5a5;
    color: #f2f2f2;
    transform: none;
    box-shadow: none;
  }
`

export default Button
