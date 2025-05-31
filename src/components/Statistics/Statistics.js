import { useTranslation } from 'react-i18next';
import { formatTime } from '../../utils/statisticsUtils';
import useTeamStatistics from '../../hooks/useTeamStatistics';
import { Typography, Select, MenuItem } from '@mui/material';
import { Root, ControlsWrapper, TableWrapper, StyledDataGrid } from './Statistics.styles';

function Statistics({ teamId }) {
  const { t } = useTranslation();
  const { period, setPeriod, teamName, rows, loading } = useTeamStatistics(teamId);

  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

  // Column definitions for the DataGrid
  const columns = [
    { 
      field: 'rank', 
      headerName: t('rank'), 
      width: 100,
      sortable: false
    },
    { 
      field: 'username', 
      headerName: t('usernameCol'), 
      width: 200,
      sortable: false
    },
    { 
      field: 'totalTime', 
      headerName: t('totalStandingTimeCol'), 
      width: 200,
      sortable: false,
      valueFormatter: (value) => formatTime(value),
      
    },
    { 
      field: 'avgTime', 
      headerName: t('averageSessionTimeCol'), 
      width: 200,
      sortable: false,
      valueFormatter: (value) => formatTime(value),
    
    },
    { 
      field: 'longestSession', 
      headerName: t('longestSessionCol'), 
      width: 200,
      sortable: false,
      valueFormatter: (value) => formatTime(value),
    
    },
    { 
      field: 'sessions', 
      headerName: t('totalSessionsCol'), 
      width: 150,
      sortable: false,
      type: 'number'
    }
  ];

  return (
    <Root maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        {t('teamStatistics')} – {teamName}
      </Typography>

      <ControlsWrapper>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          {periods.map((p) => (
            <MenuItem key={p} value={p}>
              {t(p)}
            </MenuItem>
          ))}
        </Select>
      </ControlsWrapper>

      <TableWrapper>
        <StyledDataGrid
           rows={rows}
           columns={columns}
           pageSize={5}
           rowsPerPageOptions={[5, 10, 25]}
           disableColumnMenu
           disableColumnFilter
           disableColumnSelector
           disableSelectionOnClick
           loading={loading}
        />
      </TableWrapper>
    </Root>
  );
}

export default Statistics;