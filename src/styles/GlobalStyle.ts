// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`

  :root {
    /* Soft sage-mint brand palette */
    --brand: #34a37e;                 /* base sage — light-mode accent (text, icons, borders) */
    --brand-soft: #6ee7b7;            /* light mint — dark-mode accent */
    --brand-fill: linear-gradient(135deg, #2f9e7a, #4bc7a6);       /* solid fills w/ light text */
    --brand-fill-hover: linear-gradient(135deg, #34a985, #55d4b4);
    --brand-border: rgba(52, 163, 126, 0.6);
    --brand-border-soft: rgba(110, 231, 183, 0.4);
    --brand-glow: rgba(52, 163, 126, 0.4);
    --brand-glow-strong: rgba(52, 163, 126, 0.55);
    --brand-ring: rgba(52, 163, 126, 0.35);
    --brand-ring-faint: rgba(52, 163, 126, 0.12);
    --on-brand: #f0fff9;              /* text on brand fills */
  }

  @media (max-width: 768px) {
    body {
      padding: 0;
    }

    /* Main content spans the full width once the sidebar drops to a bottom
       bar; small side padding keeps content off the screen edges and the
       extra bottom padding clears the fixed nav. */
    main {
      padding: 0 0.75rem 5rem !important;
    }

    /* Adjust font sizes */
    h1 {
      font-size: 1.75rem !important;
    }

    h2 {
      font-size: 1.25rem !important;
    }
  }

[data-mantine-color-scheme='dark'],
[data-mantine-color-scheme='light'] {
  transition:
    background-color 0.3s ease,
    color 0.3s ease !important;
}


* {
    box-sizing: border-box;
}
    html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }


[data-mantine-color-scheme='dark'] *,
[data-mantine-color-scheme='light'] * {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,grid-template-columns 0.3s ease !important;
}
[data-mantine-color-scheme='dark'] body {
  color: #eee;
  height: 100%;
  background:linear-gradient(
    145deg,
    #081410 0%,
    #0e2119 50%,
    #081410 100%
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
  color: #222;
  height: 100%;
  background:linear-gradient(
    145deg,
    #f1faf6 0%,
    #cfe9dd 50%,
    #f1faf6 100%
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

[data-mantine-color-scheme='dark'] svg {
  transition: color 0.3s ease !important;
}

[data-mantine-color-scheme='light'] svg {
  transition: color 0.3s ease !important;
}
:root {
  --sidebar-width: 80px;
}

body.sidebar-expanded {
  --sidebar-width: 220px;
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
  color: #bbf7d0;
 }

  [data-mantine-color-scheme='light'] h1 {
  color: #14532d;
  transition: color 0.3s ease !important;
 }

[data-mantine-color-scheme='light'] h2,
span,
a,
p{
  transition: color 0.3s ease !important;
  color: var(--mantine-color-text);
}
`
