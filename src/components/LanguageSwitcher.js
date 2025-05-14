import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => changeLanguage('de')} aria-label="Deutsch">
        <span role="img" aria-label="Deutsch">🇩🇪</span>
      </IconButton>
      <IconButton color="inherit" onClick={() => changeLanguage('en')} aria-label="English">
        <span role="img" aria-label="English">🇬🇧</span>
      </IconButton>
    </>
  );
}

export default LanguageSwitcher;
