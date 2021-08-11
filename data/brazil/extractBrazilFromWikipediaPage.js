const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

fs.readFile('./brazil.html', 'UTF-8', (err, data) => {
  if (err) throw err;

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

  fs.writeFile('./brazil.json', JSON.stringify(cities), 'UTF-8', err => {
    if (err) throw err;

    console.log('The file has been saved!');
  });
});