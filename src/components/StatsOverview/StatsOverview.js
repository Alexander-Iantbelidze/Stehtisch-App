import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Root, StatsStack } from './StatsOverview.styles';

/**
 * Displays formatted statistics overview.
 */
function StatsOverview({ formattedDailyTime, formattedAverageTime, formattedLongestTime }) {
  const { t } = useTranslation();
  return (
    <Root>
      <Typography variant="h6">{t('yourStatistics')}</Typography>

      <StatsStack spacing={1}>
        <Typography variant="body1">
          {t('dailyStandingTime')}: {formattedDailyTime}
        </Typography>
        <Typography variant="body1">
          {t('averageSessionTime')}: {formattedAverageTime}
        </Typography>
        <Typography variant="body1">
          {t('longestSession')}: {formattedLongestTime}
        </Typography>
      </StatsStack>
    </Root>
  );
}

export default StatsOverview;
