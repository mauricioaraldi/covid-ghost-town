import { useEffect, useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import debounce from 'debounce';

import Footer from 'components/footer/footer';

import { styleNumber } from 'utils';

import { COVID_DEATHS, MAP_INITIAL_POS, MAP_MULTIPLIER, MAP_SIZE } from 'constants/brazil';
import {
  COLOR,
  MARKER_LAT_LON_RADIUS,
  MARKER_SIZE,
  MAX_DETECTION_THRESHOLD,
} from 'constants/map';
import CITIES from 'data/brazil/data.json';

import styles from 'styles/country.module.css';

export default function Country() {
  const { t } = useTranslation('country');
  const canvas = useRef();
  const mapMultipliers = {
    lat: MAP_SIZE.height / MAP_MULTIPLIER.lat,
    lon: MAP_SIZE.width / MAP_MULTIPLIER.lon,
  };
  const [screenMultipliers, setScreenMultipliers] = useState({ ...mapMultipliers });
  const [ghostCities, setGhostCities] = useState(new Set());
  const [lockedLatLon, setLockedLatLon] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const totalPopulation = Array.from(ghostCities).reduce((acc, city) => acc + city.population, 0);

  const references = [
    {
      title: t('deathCount'),
      link: 'https://www.worldometers.info/coronavirus/country/brazil/',
    },
    {
      title: t('listCitiesPopulation'),
      // eslint-disable-next-line max-len
      link: 'https://pt.wikipedia.org/wiki/Lista_de_munic%C3%ADpios_do_Brasil_por_popula%C3%A7%C3%A3o_(2020)',
    },
    {
      title: t('latitudeLongitudeCities'),
      link: 'https://github.com/kelvins/Municipios-Brasileiros',
    },
    {
      title: t('blankMap'),
      link: 'https://www.pngwing.com/en/free-png-bbpen',
    },
  ];

  const selectLatLon = (lat, lon) => {
    const citiesInRange = new Set();
    let currentRange = MAX_DETECTION_THRESHOLD;
    let citiesPopulation = 0;

    Object.values(CITIES).forEach(city => {
      const cityRelativeLat = Math.abs(MAP_INITIAL_POS.lat - city.lat);
      const cityRelativeLon = Math.abs(MAP_INITIAL_POS.lon - city.lon);

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

      citiesInRange.forEach(city => {
        const cityRelativeLat = Math.abs(MAP_INITIAL_POS.lat - city.lat);
        const cityRelativeLon = Math.abs(MAP_INITIAL_POS.lon - city.lon);

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

  const canvasMouseMove = ev => {
    if (lockedLatLon) {
      return;
    }

    const { clientX, clientY, target } = ev;
    const currentScroll = document.documentElement.scrollTop;
    const top = clientY - target.offsetTop + currentScroll;
    const left = clientX - target.offsetLeft;
    const lat = top / screenMultipliers.lat;
    const lon = left / screenMultipliers.lon;

    selectLatLon(lat, lon);
  };

  const canvasClick = ev => {
    const { clientX, clientY, target } = ev;
    const currentScroll = document.documentElement.scrollTop;
    const top = clientY - target.offsetTop + currentScroll;
    const left = clientX - target.offsetLeft;
    const lat = top / screenMultipliers.lat;
    const lon = left / screenMultipliers.lon;

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

    setSearchValue(term);

    const normalizedTerm = term.toLowerCase();
    const possibleMatches = Object.values(CITIES).filter(c => {
      const normalizedName = c.name.toLowerCase();

      return normalizedName.includes(normalizedTerm);
    });
    const city = possibleMatches.reduce((acc, c) => {
      if (!acc || c.name.length < acc.name.length) {
        return c;
      }

      return acc;
    }, null);

    if (city) {
      const relativeLat = Math.abs(MAP_INITIAL_POS.lat - city.lat);
      const relativeLon = Math.abs(MAP_INITIAL_POS.lon - city.lon);

      selectLatLon(relativeLat, relativeLon);
      setLockedLatLon([relativeLat, relativeLon]);
    }
  }, 300);

  const onSearch = ev => {
    debounceSearch(ev.target.value);
  };

  const htmlHighlightString = (string, highlight) => {
    if (!string || !highlight || !string.toLowerCase().includes(highlight.toLowerCase())) {
      return string;
    }

    const highlightIndex = string.toLowerCase().indexOf(highlight.toLowerCase());
    const pre = string.slice(0, highlightIndex);
    const content = string.slice(highlightIndex, highlightIndex + highlight.length);
    const post = string.slice(highlightIndex + highlight.length);

    return (
      <span>
        {pre}<span className={styles.textHighlight}>{content}</span>{post}
      </span>
    );
  };

  useEffect(() => {
    if (!canvas.current) {
      return null;
    }

    const ctx = canvas.current.getContext('2d');
    const mapImg = document.createElement('img');
    const markerImg = document.createElement('img');
    let ticker = null;

    const drawMap = img => {
      ctx.drawImage(img, 0, 0, MAP_SIZE.width, MAP_SIZE.height);
    };

    const drawMarker = (img, latLon) => {
      const [lat, lon] = latLon;

      ctx.drawImage(
        img,
        (lon * mapMultipliers.lon) - (MARKER_SIZE.width / 2),
        (lat * mapMultipliers.lat) - MARKER_SIZE.height,
        MARKER_SIZE.width,
        MARKER_SIZE.height,
      );
    };

    const drawCities = () => {
      Object.values(CITIES).forEach(city => {
        const y = Math.abs(MAP_INITIAL_POS.lat - city.lat) * mapMultipliers.lat;
        const x = Math.abs(MAP_INITIAL_POS.lon - city.lon) * mapMultipliers.lon;

        if (city.inRange) {
          ctx.fillStyle = COLOR.inRangeHighlight;
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }

        ctx.fillStyle = city.inRange ? COLOR.inRange : COLOR.cities;
        ctx.fillRect(x - 1, y - 1, 2, 2);
      });
    };

    mapImg.src = '/images/map_brazil.png';
    markerImg.src = '/images/marker.png';

    ticker = setInterval(() => {
      ctx.clearRect(0, 0, MAP_SIZE.width, MAP_SIZE.height);

      drawCities();
      drawMap(mapImg);

      if (lockedLatLon) {
        drawMarker(markerImg, lockedLatLon);
      }
    }, 100);

    return () => {
      if (ticker) {
        clearInterval(ticker);
      }
    };
  }, [mapMultipliers, lockedLatLon]);

  useEffect(() => {
    if (!canvas.current) {
      return null;
    }

    const newMultipliers = {
      lat: canvas.current.clientHeight / MAP_MULTIPLIER.lat,
      lon: canvas.current.clientWidth / MAP_MULTIPLIER.lon,
    };

    if (newMultipliers.lat !== screenMultipliers.lat) {
      setScreenMultipliers(newMultipliers);
    }
  }, [canvas]);

  return (
    <>
      <main className={styles.container}>
        <h2 className={styles.title}>
          <span>{t('brazil')} - {t('totalCovidDeaths')}</span>
          <span className="textSeparatorR">:</span>
          <span>{styleNumber(COVID_DEATHS)} {t('people').toLowerCase()}</span>
        </h2>

        <div className={styles.mainContainer}>
          <div className={styles.infoContainer}>
            <p className={styles.firstParagraph}>{t('goalIsBringAwareness')}</p>

            <p>{t('mouseForResults')}</p>

            <p>{t('afterSelectingRegion')}</p>

            <p>{t('citiesWillBeMarked')} <span className="bold">{t('thisMeansGhostTown')}</span></p>

            <p>{t('forReferencesAboutInformation')}</p>

            <canvas
              className={styles.map}
              ref={canvas}
              height={MAP_SIZE.height}
              width={MAP_SIZE.width}
              onMouseMove={canvasMouseMove}
              onClick={canvasClick}
            />
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.infoTitleContainer}>
              <h3 className={styles.infoTitle}>{t('thoseCitiesWouldBeEmpty')}</h3>

              <label className={styles.searchField}>
                <span>{t('search')}</span>
                <input
                  onKeyUp={onSearch}
                  onChange={onSearch}
                  type="search"
                  placeholder={t('searchForCity')}
                  list="citiesDatalist"
                />

                <datalist id="citiesDatalist">
                  {
                    Object.values(CITIES).map(city => <option value={city.name} key={city.id} />)
                  }
                </datalist>
              </label>
            </div>
            <ul className={styles.citiesList}>
              {
                Array.from(ghostCities).map(city => (
                  <li key={city.id}>
                    {htmlHighlightString(city.name, searchValue)}
                    <span className="textSeparator">-</span>
                    {styleNumber(city.population)} {t('people').toLowerCase()}
                  </li>
                ))
              }
            </ul>
            <p className={styles.total}>
              {t('total')}: {styleNumber(totalPopulation)} {t('people').toLowerCase()}
            </p>
          </div>
        </div>
      </main>
      <Footer references={references} />
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['country', 'footer', 'header'])),
    },
  };
}
