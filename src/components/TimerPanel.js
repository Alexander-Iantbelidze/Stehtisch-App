import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../utils/statisticsUtils';
import StatsOverview from './StatsOverview';

function TimerPanel({ user, isStanding, currentSessionTime, toggleStanding, isLargeScreen,
  formattedDailyTime, formattedAverageTime, formattedLongestTime }) {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,  
        maxHeight: {
          lg: 650,
          xl: 'none',
        },
        overflow: 'hidden',
      }}
    >
      <Typography variant="h4" gutterBottom>
        {t('welcome', { username: user.username })}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: isLargeScreen ? 200 : 150,
          height: isLargeScreen ? 200 : 150,
          borderRadius: '50%',
          border: (theme) => `2px solid ${theme.palette.primary.main}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          overflow: 'visible',
        }}
      >
        {isStanding && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: 'ripple 1.5s infinite ease-in-out',
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
              '@keyframes ripple': {
                '0%': { transform: 'scale(1)', opacity: 0.5 },
                '100%': { transform: 'scale(1.5)', opacity: 0 },
              },
            }}
          />
        )}
        <Typography variant="h5" color="text.secondary">
          {formatTime(currentSessionTime)}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color={isStanding ? 'secondary' : 'primary'}
        onClick={toggleStanding}
        startIcon={isStanding ? <Stop /> : <PlayArrow />}
        sx={{ mt: 2, width: '100%', maxWidth: 200 }}
      >
        {isStanding ? t('stopStanding') : t('startStanding')}
      </Button>

      <StatsOverview
        formattedDailyTime={formattedDailyTime}
        formattedAverageTime={formattedAverageTime}
        formattedLongestTime={formattedLongestTime}
      />

    </Paper>
  );
}

export default TimerPanel;
