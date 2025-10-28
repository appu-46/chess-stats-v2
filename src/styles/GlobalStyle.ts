// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @import 'tailwindcss';

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
body {
  height: 100%;
  [data-mantine-color-scheme] {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease,
      width 0.5s ease !important;
  }

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

/* Smooth transitions for Mantine Switch */
.mantine-Switch-track {
  transition: background-color 0.3s ease !important;
}

.mantine-Switch-thumb {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Smooth icon transitions */
.mantine-Switch-thumb > svg {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease !important;
}

/* Optional: Add a subtle scale effect */
.mantine-Switch-input:checked ~ .mantine-Switch-track .mantine-Switch-thumb {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Automatic color change based on theme */
h1,
h2,
span,
a {
  color: var(--mantine-color-text);
  transition: color 0.3s ease !important;
}

[data-mantine-color-scheme='dark'] h1,
h2,
span,
a {
  color: var(--mantine-color-text);
}

[data-mantine-color-scheme='light'] h1,
h2,
span,
a {
  color: var(--mantine-color-text);
}

/* Responsive container */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem; /* for breathing room */
}

/* Typography scaling */
h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

h2 {
  font-size: clamp(1.2rem, 4vw, 2rem);
}

p,
span,
a {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* Make images and videos scale */
img,
video {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/* Prevent overflow */
body,
html {
  overflow-x: hidden;
}
`
