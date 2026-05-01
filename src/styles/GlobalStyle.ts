// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
[data-mantine-color-scheme='dark'],
[data-mantine-color-scheme='light'] {
  transition:
    background-color 0.3s ease,
    color 0.3s ease !important;
}

[data-mantine-color-scheme='dark'] *,
[data-mantine-color-scheme='light'] * {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease !important;
}
[data-mantine-color-scheme='dark'] body {
  height: 100%;
  background:linear-gradient(
    145deg, 
    #020617 0%,    
    #0F172A 50%,  
    #020617 100%  
  );;
  [data-mantine-color-scheme] {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease,
      width 0.5s ease !important;
  };
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
[data-mantine-color-scheme='light'] body {
  height: 100%;
  background:linear-gradient(
    145deg, 
    #F9FAFB 0%,    
    #CBD5E1 50%,  
    #F9FAFB 100%  
  );;
  [data-mantine-color-scheme] {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease,
      width 0.5s ease !important;
  };
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
code {
  font-family:
    source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

.mantine-Switch-track {
  transition: background-color 0.3s ease !important;
}

.mantine-Switch-thumb {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.mantine-Switch-thumb > svg {
  transition: color 0.3s ease !important;
}

.mantine-Switch-input:checked ~ .mantine-Switch-track .mantine-Switch-thumb {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

div {
  transition: color 0.3s ease !important;
}

h2,
h3,
span,
a,
p{
  color: var(--mantine-color-text);
  transition: color 0.3s ease !important;
}

[data-mantine-color-scheme='dark']
h2,
span,
a,
p {
  transition: color 0.3s ease !important;
  color: var(--mantine-color-text);
}
 [data-mantine-color-scheme='dark'] h1 {
  transition: color 0.3s ease !important;
  background: linear-gradient(135deg, #a78bfa, #ec4899);
  background-clip: text;
 }

  [data-mantine-color-scheme='light'] h1 {
 background: linear-gradient(135deg, #4c1d95, #831843);
  transition: color 0.3s ease !important;

  background-clip: text;
 }

[data-mantine-color-scheme='light'] h2,
span,
a,
p{
  transition: color 0.3s ease !important;
  color: var(--mantine-color-text);
}
`
