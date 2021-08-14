import { useEffect, useRef } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

import { MAP_SIZE, POS } from '/constants/brazil';
import CITIES from '/data/brazil/data.json';

import styles from '/styles/country.module.css';

export default function Country() {
  const canvas = useRef();

  const drawMap = () => {
    const ctx = canvas.current.getContext('2d');
    const img = document.createElement('img');

    img.src = "/images/map_brazil.png";

    img.onload = () => {
      ctx.drawImage(img, 0, 0, MAP_SIZE.height, MAP_SIZE.width);
    };
  };

  const drawCities = () => {
    const ctx = canvas.current.getContext('2d');

    Object.values(CITIES).forEach(city => {
      const lat = Math.abs(POS.lat - city.lat) * (MAP_SIZE.height / 39.215);
      const lon = Math.abs(POS.lon - city.lon) * (MAP_SIZE.height / 39.344);

      ctx.fillStyle = 'red';
      ctx.fillRect(lon - 1, lat - 1, 2, 2);
    });
  };

  useEffect(() => {
    drawMap();
    drawCities();
  }, []);

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>Brazil</h2>

      <canvas className={styles.map} ref={canvas} height={MAP_SIZE.height} width={MAP_SIZE.width}>
      </canvas>
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
