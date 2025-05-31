import { styled } from '@mui/material/styles';
import { Container as MuiContainer, Box as MuiBox } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Root container with vertical padding
export const Root = styled(MuiContainer)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

// Wrapper for controls with bottom margin
export const ControlsWrapper = styled(MuiBox)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

// Wrapper for the data grid to set height and full width
export const TableWrapper = styled(MuiBox)(() => ({
  height: 400,
  width: '100%',
}));

// Styled DataGrid to apply cell and header borders
export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid rgba(224, 224, 224, 1)',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));
