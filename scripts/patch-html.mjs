import { readFileSync, writeFileSync } from 'fs';

const file = 'dist/index.html';
const html = readFileSync(file, 'utf8');

const meta = `
    <title>Match GBG – Bästa dejtingappen i Göteborg</title>
    <meta name="description" content="Match GBG är Göteborgs bästa dejtingapp. Hitta kärlek och dejter i Göteborg. The best dating app in Gothenburg, Sweden." />
    <meta name="keywords" content="dejting göteborg, dating göteborg, bästa dejtingapp, dating gothenburg, dating sweden, match gbg, kärlek göteborg" />
    <meta name="theme-color" content="#e91e8c" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://matchgbg.se" />
    <meta property="og:title" content="Match GBG – Bästa dejtingappen i Göteborg ❤️" />
    <meta property="og:description" content="Hitta din match i Göteborg. Gratis att komma igång!" />
    <meta property="og:image" content="https://matchgbg.se/og-image.svg" />
    <meta property="og:locale" content="sv_SE" />
    <meta property="og:site_name" content="Match GBG" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Match GBG – Bästa dejtingappen i Göteborg ❤️" />
    <meta name="twitter:description" content="Hitta din match i Göteborg. Gratis att komma igång!" />
    <meta name="twitter:image" content="https://matchgbg.se/og-image.svg" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />`;

// Replace the generated <title> and inject our meta tags before </head>
const patched = html
  .replace(/<title>.*?<\/title>/, '')
  .replace('</head>', meta + '\n  </head>');

writeFileSync(file, patched, 'utf8');
console.log('✅ HTML patched with meta tags');
