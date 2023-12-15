import { Global, css } from '@emotion/react';

const GlobalStyle = () => {
  return <Global styles={globalCSS} />;
};

const resetCSS = css`
  html,
  body,
  div,
  span,
  applet,
  object,
  iframe,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  blockquote,
  pre,
  a,
  abbr,
  acronym,
  address,
  big,
  cite,
  code,
  del,
  dfn,
  em,
  img,
  ins,
  kbd,
  q,
  s,
  samp,
  small,
  strike,
  strong,
  sub,
  sup,
  tt,
  var,
  b,
  u,
  i,
  center,
  dl,
  dt,
  dd,
  ol,
  ul,
  li,
  fieldset,
  form,
  label,
  legend,
  table,
  caption,
  tbody,
  tfoot,
  thead,
  tr,
  th,
  td,
  article,
  aside,
  canvas,
  details,
  embed,
  figure,
  figcaption,
  footer,
  header,
  hgroup,
  menu,
  nav,
  output,
  ruby,
  section,
  summary,
  time,
  mark,
  audio,
  video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    vertical-align: baseline;
  }

  /* HTML5 display-role reset for older browsers */
  article,
  aside,
  details,
  figcaption,
  figure,
  footer,
  header,
  hgroup,
  menu,
  nav,
  section {
    display: block;
  }

  ol,
  ul {
    list-style: none;
  }

  blockquote,
  q {
    quotes: none;
  }

  blockquote:before,
  blockquote:after,
  q:before,
  q:after {
    content: '';
    content: none;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  input,
  select,
  textarea,
  button {
    font: inherit;
    color: inherit;
  }

  button {
    background: transparent;
    cursor: pointer;
    border: none;
    padding: 0;
  }

  ul {
    list-style: none;
  }

  body {
    line-height: 1;
    width: 100%;
  }

  * {
    box-sizing: border-box;
    user-select: none;
  }
`;

const globalCSS = css`
  @font-face {
    font-family: 'Maplestory';
    font-style: normal;
    font-weight: bold;
    font-display: swap;
    src:
      local('Maplestory Bold'),
      url('/fonts/Maplestory OTF Bold.otf') format('opentype'),
      url('/fonts/Maplestory Bold.ttf') format('ttf');
  }

  @font-face {
    font-family: 'Maplestory';
    font-style: normal;
    font-weight: light;
    font-display: swap;
    src:
      local('Maplestory Light'),
      url('/fonts/Maplestory OTF Light.otf') format('opentype'),
      url('/fonts/Maplestory Light.ttf') format('ttf');
  }

  ${resetCSS}
`;

export default GlobalStyle;
