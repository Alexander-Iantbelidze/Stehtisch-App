import { useTranslation } from 'react-i18next';

function useLanguage() {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const changeLanguage = (lng) => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
  };

  return { language, changeLanguage };
}

export default useLanguage;
