const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/brazil',
        permanent: true,
      },
    ]
  },
};