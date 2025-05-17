import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem } from '@mui/material';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      size="small"
      variant="standard"
      disableUnderline
      sx={{
        color: 'inherit',
        minWidth: 50,
        ml: 1,
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.2rem',
          lineHeight: 1,
          transform: 'translateY(2px)',
          pr: 5,
        },
        '& .MuiSelect-icon': {
          color: 'inherit',
        },
      }}
      MenuProps={{ PaperProps: { sx: { mt: 1 } } }}
    >
      <MenuItem value="de">🇩🇪</MenuItem>
      <MenuItem value="en">🇬🇧</MenuItem>
    </Select>
  );
}

export default LanguageSwitcher;
