import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Displays formatted statistics overview.
 */
function StatsOverview({ formattedDailyTime, formattedAverageTime, formattedLongestTime }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 4, width: '100%' }}>
      <Typography variant="h6">{t('yourStatistics')}</Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        <Typography variant="body1">
          {t('dailyStandingTime')}: {formattedDailyTime}
        </Typography>
        <Typography variant="body1">
          {t('averageSessionTime')}: {formattedAverageTime}
        </Typography>
        <Typography variant="body1">
          {t('longestSession')}: {formattedLongestTime}
        </Typography>
      </Stack>
    </Box>
  );
}

export default StatsOverview;
