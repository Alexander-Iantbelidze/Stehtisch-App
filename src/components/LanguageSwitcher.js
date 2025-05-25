import React from 'react';
import { Select, MenuItem } from '@mui/material';
import useLanguage from '../hooks/useLanguage';

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <Select
      value={language}
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
