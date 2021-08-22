import { useEffect, useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import debounce from 'debounce';

import { styleNumber } from '/utils';

import { COVID_DEATHS, MAP_SIZE, MULTIPLIER, POS } from '/constants/brazil';
import {
  COLOR,
  MARKER_LAT_LON_RADIUS,
  MARKER_SIZE,
  MAX_DETECTION_THRESHOLD,
} from '/constants/map';
import CITIES from '/data/brazil/data.json';

import styles from '/styles/country.module.css';

export default function Country() {
  const { t } = useTranslation('country');
  const canvas = useRef();
  const latMultiplier = MAP_SIZE.height / MULTIPLIER.lat;
  const lonMultiplier = MAP_SIZE.height / MULTIPLIER.lon;
  const [ghostCities, setGhostCities] = useState(new Set());
  const [lockedLatLon, setLockedLatLon] = useState(null);
  const totalPopulation = Array.from(ghostCities).reduce((acc, city) => acc + city.population, 0);

  const drawMap = (img) => {
    const ctx = canvas.current.getContext('2d');
    ctx.drawImage(img, 0, 0, MAP_SIZE.width, MAP_SIZE.height);
  };

  const drawMarker = (img, latLon) => {
    const ctx = canvas.current.getContext('2d');
    const [lat, lon] = latLon;

    ctx.drawImage(
      img,
      (lon * lonMultiplier) - (MARKER_SIZE.width / 2),
      (lat * latMultiplier) - MARKER_SIZE.height,
      MARKER_SIZE.width,
      MARKER_SIZE.height
    );
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

  const selectLatLon = (lat, lon) => {
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

  const canvasMouseMove = (ev) => {
    if (lockedLatLon) {
      return;
    }

    const { clientX, clientY, target } = ev;
    const currentScroll = document.documentElement.scrollTop;
    const top = clientY - target.offsetTop + currentScroll;
    const left = clientX - target.offsetLeft;
    const lat = top / latMultiplier;
    const lon = left / lonMultiplier;

    selectLatLon(lat, lon);
  };

  const canvasClick = (ev) => {
    const { clientX, clientY, target } = ev;
    const currentScroll = document.documentElement.scrollTop;
    const top = clientY - target.offsetTop + currentScroll;
    const left = clientX - target.offsetLeft;
    const lat = top / latMultiplier;
    const lon = left / lonMultiplier;

    if (lockedLatLon) {
      const [lockedLat, lockedLon] = lockedLatLon;

      if (lat > lockedLat - MARKER_LAT_LON_RADIUS.lat
          && lat < lockedLat
          && lon > lockedLon - (MARKER_LAT_LON_RADIUS.lon / 2)
          && lon < lockedLon + (MARKER_LAT_LON_RADIUS.lon / 2)) {
        setLockedLatLon(null);
        return;
      }
    }

    setLockedLatLon([lat, lon]);
    selectLatLon(lat, lon);
  };

  const debounceSearch = debounce(term => {
    if (term.length < 3) {
      return;
    }

    const city = Object.values(CITIES).find(city =>
      city.name.toLowerCase().includes(term.toLowerCase()));

    if (city) {
      const relativeLat = Math.abs(POS.lat - city.lat);
      const relativeLon = Math.abs(POS.lon - city.lon);

      selectLatLon(relativeLat, relativeLon);
      setLockedLatLon([relativeLat, relativeLon]);
    }
  }, 300);

  const onKeyUpSearch = ev => {
    debounceSearch(ev.target.value);
  };

  useEffect(() => {
    if (!canvas.current) {
      return;
    }

    const ctx = canvas.current.getContext('2d');
    const mapImg = document.createElement('img');
    const markerImg = document.createElement('img');
    let ticker = null;

    mapImg.src = '/images/map_brazil.png';
    markerImg.src = '/images/marker.png';

    ticker = setInterval(() => {
      ctx.clearRect(0, 0, MAP_SIZE.width, MAP_SIZE.height);

      drawMap(mapImg);
      drawCities();

      if (lockedLatLon) {
        drawMarker(markerImg, lockedLatLon);
      }
    }, 100);

    return () => {
      if (ticker) {
        clearInterval(ticker);
      }
    };
  }, [lockedLatLon]);

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>
        {t('brazil')} - {t('totalCovidDeaths')}: {styleNumber(COVID_DEATHS)}
      </h2>

      <div className={styles.mapContainer}>
        <div className={styles.infoContainer}>
          <p className={styles.firstParagraph}>{t('mouseForResults')}</p>

          <p>{t('afterSelectingRegion')}</p>

          <p>{t('citiesWillBeMarked')} {t('thisMeansGhostTown')}</p>

          <p>{t('forReferencesAboutInformation')}</p>

          <canvas
            className={styles.map}
            ref={canvas}
            height={MAP_SIZE.height}
            width={MAP_SIZE.width}
            onMouseMove={canvasMouseMove}
            onClick={canvasClick}
          >
          </canvas>
        </div>

        <div className={styles.infoContainer}>
          <div className={styles.infoTitleContainer}>
            <p className={styles.infoTitle}>{t('thoseCitiesWouldBeEmpty')}</p>

            <label className={styles.searchField}>
              <span>{t('search')}</span>
              <input onKeyUp={onKeyUpSearch} type="search" placeholder={t('searchForCity')} />
            </label>
          </div>
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
