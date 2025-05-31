import React from 'react';
import { MenuItem } from '@mui/material';
import useLanguage from '../../hooks/useLanguage';
import { StyledSelect, menuPaperProps } from './LanguageSwitcher.styles';

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <StyledSelect
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      size="small"
      variant="standard"
      disableUnderline
      MenuProps={{ PaperProps: menuPaperProps }}
    >
      <MenuItem value="de">🇩🇪</MenuItem>
      <MenuItem value="en">🇬🇧</MenuItem>
    </StyledSelect>
  );
}

export default LanguageSwitcher;
