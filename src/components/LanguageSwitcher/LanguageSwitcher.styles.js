import { styled } from '@mui/material/styles';
import { Select } from '@mui/material';

// Styled Select for language switcher
export const StyledSelect = styled(Select)(({ theme }) => ({
  color: 'inherit',
  minWidth: 50,
  marginLeft: theme.spacing(1),
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
    lineHeight: 1,
    transform: 'translateY(2px)',
    paddingRight: theme.spacing(5),
  },
  '& .MuiSelect-icon': {
    color: 'inherit',
  },
}));

// PaperProps for select menu positioning
export const menuPaperProps = {
  sx: { mt: 1 },
};
