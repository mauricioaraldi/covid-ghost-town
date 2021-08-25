import { useTranslation } from 'next-i18next';

import styles from './footer.module.css';

function Footer(props) {
  const { t } = useTranslation('footer');

  return (
    <footer className={styles.footer}>
      <div>
        <h3>{t('references')}</h3>

        <ul>
          { props.references.map(ref => (
            <li key={ref.title}>
              <span>{ref.title}:</span>
              <a href={ref.link} target="_blank" rel="noreferrer">{ref.link}</a>
            </li>
          )) }
        </ul>
      </div>

      <div>
        <ul>
          <li>
            <span>{t('repository')}:</span>
            <a
              href="https://github.com/mauricioaraldi/covid-ghost-town"
              target="_blank"
              rel="noreferrer"
            >
              https://github.com/mauricioaraldi/covid-ghost-town
            </a>
          </li>

          <li>
            <span>{t('license')}:</span>
            <a
              href="https://github.com/mauricioaraldi/covid-ghost-town/blob/development/LICENSE"
              target="_blank"
              rel="noreferrer"
            >
              GNU General Public License v3.0
            </a>
          </li>

          <li className={styles.author}>
            <span>{t('by')}</span>
            <a
              href="https://github.com/mauricioaraldi"
              target="_blank"
              rel="noreferrer"
            >
              Maurício Luis Comin Araldi
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
