import { appWithTranslation } from 'next-i18next';

import Header from '/components/header/header';

import '/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp);
