// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`

  @media (max-width: 768px) {
    body {
      padding: 0;
    }


    [class*="Container"],
    [class*="Wrapper"],
    [class*="Box"] {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }


    [style*="display: flex"],
    [style*="display: grid"] {
      flex-direction: column !important;
      grid-template-columns: 1fr !important;
    }


    div[class*="Card"],
    div[class*="Stats"] {
      max-width: 100% !important;
      width: 100% !important;
    }

    /* Adjust font sizes */
    h1 {
      font-size: 1.75rem !important;
    }

    h2 {
      font-size: 1.25rem !important;
    }
  }


  @media (max-width: 1024px) and (min-width: 769px) {
    [style*="display: grid"] {
      grid-template-columns: repeat(2, 1fr) !important;
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
  color: #222;
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
  --sidebar-width: 20vh;
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
