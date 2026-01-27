import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Optimisation SEO */}
        <meta charSet="UTF-8" />
        <meta name="description" content="Portfolio de Yovish MOONESAMY - Développeur Web alternant spécialisé en Next.js, React et TypeScript" />
        <meta name="keywords" content="développeur web, portfolio, Next.js, React, TypeScript, alternance" />
        <meta name="author" content="Yovish MOONESAMY" />

        {/* Optimisation mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Preconnect pour Google Fonts (déjà dans globals.css mais on optimise) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
