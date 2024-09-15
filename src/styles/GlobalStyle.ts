import { createGlobalStyle } from 'styled-components'

interface GlobalStyleProps {
  font: string;
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100vh;
  }

  body {
    font-family: ${props => props.font};
    font-size: 16px !important;
    color: #E1E1E6;
  }

  a {
    color: #6E55AE;
    text-decoration: none;
  }

  span, p, a {
    font-family: ${props => props.font};
  }

  body#streamRoot {
      margin: 0;
      padding: 0;
  }

  div#stream {
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      margin: 0;
      border: 0;
      justify-content: space-between;
  }
`
