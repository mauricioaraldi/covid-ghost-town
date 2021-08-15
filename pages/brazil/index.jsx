import { useEffect, useRef } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

import { MAP_SIZE, MULTIPLIER, POS } from '/constants/brazil';
import { COLOR, MAX_DETECTION_THRESHOLD } from '/constants/map';
import CITIES from '/data/brazil/data.json';

import styles from '/styles/country.module.css';

export default function Country() {
  const canvas = useRef();
  const latMultiplier = MAP_SIZE.height / MULTIPLIER.lat;
  const lonMultiplier = MAP_SIZE.height / MULTIPLIER.lon;

  const drawMap = () => {
    const ctx = canvas.current.getContext('2d');
    const img = document.createElement('img');

    img.src = "/images/map_brazil.png";

    img.onload = () => {
      ctx.drawImage(img, 0, 0, MAP_SIZE.width, MAP_SIZE.height);
    };
  };

  const drawCities = () => {
    const ctx = canvas.current.getContext('2d');

    Object.values(CITIES).forEach(city => {
      const lat = Math.abs(POS.lat - city.lat) * latMultiplier;
      const lon = Math.abs(POS.lon - city.lon) * lonMultiplier;

      ctx.fillStyle = city.inRange ? COLOR.inRange : COLOR.cities;
      ctx.fillRect(lon - 1, lat - 1, 2, 2);
    });
  };

  const canvasMouseMove = (ev) => {
    const { clientX, clientY, target } = ev;
    const top = clientY - target.offsetTop;
    const left = clientX - target.offsetLeft;
    const lat = top / latMultiplier;
    const lon = left / lonMultiplier;

    Object.values(CITIES).forEach(city => {
      const cityRelativeLat = Math.abs(POS.lat - city.lat);
      const cityRelativeLon = Math.abs(POS.lon - city.lon);

      if (cityRelativeLat > lat - MAX_DETECTION_THRESHOLD
          && cityRelativeLat < lat + MAX_DETECTION_THRESHOLD
          && cityRelativeLon > lon - MAX_DETECTION_THRESHOLD
          && cityRelativeLon < lon + MAX_DETECTION_THRESHOLD) {
        city.inRange = true;
      } else {
        city.inRange = false;
      }
    });
  };

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');

    setInterval(() => {
      ctx.clearRect(0, 0, MAP_SIZE.width, MAP_SIZE.height);

      drawMap();
      drawCities();
    }, 50);
  }, []);

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>Brazil</h2>

      <canvas
        className={styles.map}
        ref={canvas}
        height={MAP_SIZE.height}
        width={MAP_SIZE.width}
        onMouseMove={canvasMouseMove}
      >
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
