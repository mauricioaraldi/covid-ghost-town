import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import styles from './header.module.css';

function Header() {
  const { t } = useTranslation('header');
  const router = useRouter();

  const selectLanguage = ev => {
    router.push(router.basePath, router.basePath, { locale: ev.target.value });
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <span>{ t('covid') }</span>
        <span className="textSeparator">-</span>
        <span>{ t('ghostTown') }</span>
      </h1>

      <label className={styles.languageSelector}>
        <p>{ t('language') }</p>

        <select defaultValue={router.locale} onChange={selectLanguage}>
          {
            router.locales.map(locale => <option key={locale} value={locale}>{t(locale)}</option>)
          }
        </select>
      </label>
    </header>
  );
}

export default Header;
