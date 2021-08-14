const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const CITIES_LAT_LON = require('./brazil_cities_lat_lon.json');

const WIKIPEDIA_URL = 'https://pt.wikipedia.org/wiki/Lista_de_munic%C3%ADpios_do_Brasil_por_popula%C3%A7%C3%A3o_(2020)';

fetch(WIKIPEDIA_URL)
  .then(data => data.text())
  .then(data => {
    const DOM = new JSDOM(data);
    const table = DOM.window.document.querySelector('table.wikitable');
    const tableRows = Array.from(table.querySelectorAll('tr')).slice(1);

    const cities = tableRows.map(tableRow => {
      const columns = Array.from(tableRow.querySelectorAll('td'));
      const info = columns.slice(1).map(column => column.textContent.replace('\n', ''));

      return {
        id: parseInt(info[0].trim(), 10),
        name: info[1].trim(),
        region: info[2].trim(),
        population: parseInt(info[3].replace(/\D/g, ''), 10),
      };
    });

    return cities
  })
  .then(cities => {
    const citiesObj = {};

    cities.map(city => {
      const cityLatLon = CITIES_LAT_LON.find(latLon => latLon['codigo_ibge'] === city.id);

      if (!cityLatLon) {
        console.error(`Lat Lon data for ${city.name} not found.`);
        return;
      }

      city.lat = cityLatLon.latitude;
      city.lon = cityLatLon.longitude;

      citiesObj[city.id] = city;
    });

    fs.writeFileSync(
      `${__dirname}/data_full.json`,
      JSON.stringify(citiesObj),
      {
        encoding: 'UTF-8',
        flag: 'wx'
      },
    );

    console.log('The file has been saved!');
  });