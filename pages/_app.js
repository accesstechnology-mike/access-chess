import "../styles/globals.css";
import Head from "next/head";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize stagewise toolbar only in development and on client side
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      import('@stagewise/toolbar').then(({ initToolbar }) => {
        initToolbar({
          plugins: []
        });
      }).catch(console.error);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2c3e50" />
        <meta name="color-scheme" content="light" />

        {/* Accessibility meta tags */}
        <meta
          name="description"
          content="Fully accessible chess game designed for keyboard-only users. Play against computer with comprehensive screen reader support."
        />
        <meta
          name="keywords"
          content="chess, accessibility, keyboard-only, screen reader, accessible game, text input"
        />
        <meta name="author" content="Accessible Chess Game" />

        {/* Open Graph for social sharing */}
        <meta
          property="og:title"
          content="Accessible Chess Game - Keyboard Only"
        />
        <meta
          property="og:description"
          content="Fully accessible chess game for keyboard-only users with screen reader support"
        />
        <meta property="og:type" content="website" />

        {/* Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://lichess.org" />

        {/* Accessibility features */}
        <meta name="robots" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
