import { useEffect, useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { styleNumber } from '/utils';

import { COVID_DEATHS, MAP_SIZE, MULTIPLIER, POS } from '/constants/brazil';
import { COLOR, MAX_DETECTION_THRESHOLD } from '/constants/map';
import CITIES from '/data/brazil/data.json';

import styles from '/styles/country.module.css';

export default function Country() {
  const { t } = useTranslation('country');
  const canvas = useRef();
  const latMultiplier = MAP_SIZE.height / MULTIPLIER.lat;
  const lonMultiplier = MAP_SIZE.height / MULTIPLIER.lon;
  const [ghostCities, setGhostCities] = useState(new Set());
  const totalPopulation = Array.from(ghostCities).reduce((acc, city) => acc + city.population, 0);

  const drawMap = (img) => {
    const ctx = canvas.current.getContext('2d');

    ctx.drawImage(img, 0, 0, MAP_SIZE.width, MAP_SIZE.height);
  };

  const drawCities = () => {
    const ctx = canvas.current.getContext('2d');

    Object.values(CITIES).forEach((city) => {
      const lat = Math.abs(POS.lat - city.lat) * latMultiplier;
      const lon = Math.abs(POS.lon - city.lon) * lonMultiplier;

      if (city.inRange) {
        ctx.fillStyle = COLOR.inRangeHighlight;
        ctx.fillRect(lon - 2, lat - 2, 4, 4);
      }

      ctx.fillStyle = city.inRange ? COLOR.inRange : COLOR.cities;
      ctx.fillRect(lon - 1, lat - 1, 2, 2);
    });
  };

  const canvasMouseMove = (ev) => {
    const { clientX, clientY, target } = ev;
    const currentScroll = document.documentElement.scrollTop;
    const top = clientY - target.offsetTop + currentScroll;
    const left = clientX - target.offsetLeft;
    const lat = top / latMultiplier;
    const lon = left / lonMultiplier;
    const citiesInRange = new Set();
    let currentRange = MAX_DETECTION_THRESHOLD;
    let citiesPopulation = 0;

    Object.values(CITIES).forEach((city) => {
      const cityRelativeLat = Math.abs(POS.lat - city.lat);
      const cityRelativeLon = Math.abs(POS.lon - city.lon);

      if (cityRelativeLat > lat - currentRange
          && cityRelativeLat < lat + currentRange
          && cityRelativeLon > lon - currentRange
          && cityRelativeLon < lon + currentRange) {
        city.inRange = true;

        citiesInRange.add(city);

        citiesPopulation += city.population;
      } else {
        city.inRange = false;
      }
    });

    while (citiesPopulation > COVID_DEATHS) {
      citiesPopulation = 0;

      currentRange -= 0.3;

      citiesInRange.forEach((city) => {
        const cityRelativeLat = Math.abs(POS.lat - city.lat);
        const cityRelativeLon = Math.abs(POS.lon - city.lon);

        if (cityRelativeLat > lat - currentRange
            && cityRelativeLat < lat + currentRange
            && cityRelativeLon > lon - currentRange
            && cityRelativeLon < lon + currentRange) {
          citiesPopulation += city.population;
        } else {
          city.inRange = false;
          citiesInRange.delete(city);
        }
      });
    }

    setGhostCities(citiesInRange);
  };

  useEffect(() => {
    if (!canvas.current) {
      return;
    }

    const ctx = canvas.current.getContext('2d');
    const img = document.createElement('img');
    let ticker = null;

    img.src = '/images/map_brazil.png';

    img.onload = () => {
      ticker = setInterval(() => {
        ctx.clearRect(0, 0, MAP_SIZE.width, MAP_SIZE.height);

        drawMap(img);
        drawCities();
      }, 100);
    };

    return () => {
      if (ticker) {
        clearInterval(ticker);
      }
    };
  }, []);

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>
        {t('brazil')} - {t('totalCovidDeaths')}: {styleNumber(COVID_DEATHS)}
      </h2>

      <div className={styles.mapContainer}>
        <div className={styles.infoContainer}>
          <p className={styles.firstParagraph}>{t('placeMouseOverMapForResults')}</p>

          <p>{t('citiesWillBeMarked')}. {t('thisMeansGhostTown')}.</p>

          <p>{t('forReferencesAboutInformation')}</p>

          <canvas
            className={styles.map}
            ref={canvas}
            height={MAP_SIZE.height}
            width={MAP_SIZE.width}
            onMouseMove={canvasMouseMove}
          >
          </canvas>
        </div>

        <div className={styles.infoContainer}>
          <p className={styles.firstParagraph}>{t('thoseCitiesWouldBeEmpty')}</p>
          <ul className={styles.citiesList}>
            {
              Array.from(ghostCities).map((city) => (
                <li key={city.id}>
                  {city.name} - {styleNumber(city.population)} {t('people').toLowerCase()}
                </li>
              ))
            }
          </ul>
          <p className={styles.total}>{t('total')}: {styleNumber(totalPopulation)} {t('people').toLowerCase()}</p>
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['country', 'header'])),
    },
  };
}
