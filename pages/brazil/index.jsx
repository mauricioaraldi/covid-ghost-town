import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

import styles from '/styles/country.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <h2 className={styles.title}>Brazil</h2>
      <Image
        className={styles.map}
        src="/images/map_brazil.png"
        alt="map"
        height="600"
        width="600"
      />
    </main>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'header'])),
    },
  };
}
