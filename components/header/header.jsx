import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import styles from './header.module.css';

function Header() {
  const { t } = useTranslation('header');
  const router = useRouter();

  const selectLanguage = (ev) => {
    router.push(router.basePath, router.basePath, { locale: ev.target.value });
  };

  return (
    <header className={styles.header}>
      <h1>
        <Link href="/">
          <a>{ t('covid_ghost_town') }</a>
        </Link>
      </h1>

      <label>
        <p className={styles.languageTitle}>{ t('language') }</p>

        <select defaultValue={router.locale} onChange={selectLanguage}>
          { router.locales.map((locale) => <option key={locale} value={locale}>{locale}</option>) }
        </select>
      </label>
    </header>
  );
}

export default Header;
