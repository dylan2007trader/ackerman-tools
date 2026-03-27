const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="g" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8EC5FF"/>
      <stop offset="1" stop-color="#3533B7"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="white"/>
  <path d="M16 54L29 10H38L50 54H41L38.7 46H27.1L24.7 54H16ZM29.5 38H36.4L33 25.7L29.5 38Z" fill="url(#g)"/>
  <path d="M22 45.5L34.5 25.5" stroke="white" stroke-width="6" stroke-linecap="round"/>
  <circle cx="20" cy="49" r="4.5" fill="#3533B7"/>
  <path d="M35 18.5C35 15.5 37.4 13 40.4 13C41.5 13 42.4 13.3 43.3 13.8L39.8 17.3L43.8 21.2L47.2 17.8C47.7 18.7 48 19.7 48 20.8C48 23.8 45.6 26.2 42.6 26.2C41.7 26.2 40.8 26 40 25.6L36.5 29.1" stroke="white" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="49.5" cy="13.5" r="2.5" fill="#5F73E6"/>
  <circle cx="52.5" cy="24.5" r="2.5" fill="#5F73E6"/>
  <path d="M46.5 16L50 16.8V22" stroke="#5F73E6" stroke-width="2.4" stroke-linecap="round"/>
</svg>
`;

export const BRAND_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
