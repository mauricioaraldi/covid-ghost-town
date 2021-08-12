const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

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
        id: info[0].trim(),
        name: info[1].trim(),
        region: info[2].trim(),
        population: parseInt(info[3].replace(/\D/g, ''), 10),
      };
    });

    return cities
  })
  .then(cities => {
    const data = fs.readFileSync(`${__dirname}/brazil_cities_ibge_lat_lon.csv`, 'UTF-8');
    const latLonData = data.split('\n').map(line => {
      const lineData = line.split(';');

      return {
        id: lineData[0],
        lat: lineData[1],
        lon: lineData[2],
      };
    });

    cities.forEach(city => {
      const cityLatLon = latLonData.find(latLon => latLon.id === city.id.slice(0, -1));

      if (!cityLatLon) {
        console.error(`Lat Lon data for ${city.name} not found.`);
        return;
      }

      city.lat = cityLatLon.lat;
      city.lon = cityLatLon.lon.replace('\r', '');
    });

    fs.writeFileSync(
      `${__dirname}/data.json`,
      JSON.stringify(cities),
      {
        encoding: 'UTF-8',
        flag: 'wx'
      },
    );

    console.log('The file has been saved!');
  });