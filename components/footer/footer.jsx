import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import styles from './footer.module.css';

function Footer(props) {
  const { t } = useTranslation('footer');
  const router = useRouter();

  return (
    <footer className={styles.footer}>
      <div>
        <h3>{t('references')}</h3>

        <ul>
          { props.references.map((ref, index) => (
            <li key={index}>
              {ref.title}: <a href={ref.link}>{ref.link}</a>
            </li>
          )) }
        </ul>
      </div>

      <div>
        <ul>
          <li>
            {t('repository')}: <a
              href="https://github.com/mauricioaraldi/covid-ghost-town">
              https://github.com/mauricioaraldi/covid-ghost-town
            </a>
          </li>

          <li>
            {t('license')}: <a
              href="https://github.com/mauricioaraldi/covid-ghost-town/blob/development/LICENSE">
              GNU General Public License v3.0
            </a>
          </li>

          <li className={styles.author}>
            {t('by')} <a href="https://github.com/mauricioaraldi">Maurício Luis Comin Araldi</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
