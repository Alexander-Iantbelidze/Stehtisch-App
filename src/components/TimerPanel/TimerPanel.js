import { Typography, Tooltip } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../../utils/statisticsUtils';
import StatsOverview from '../StatsOverview/StatsOverview';
import { Root, CircleContainer, StartStopButton, Ripple, WelcomeText } from './TimerPanel.styles';

function TimerPanel({ user, isStanding, currentSessionTime, toggleStanding, isLargeScreen,
  formattedDailyTime, formattedAverageTime, formattedLongestTime }) {
  const { t } = useTranslation();

  return (
    <Root elevation={3}>
      <Tooltip title={t('welcome', { username: user.username })} arrow>
      <WelcomeText variant="h4" gutterBottom>
        {t('welcome', { username: user.username })}
      </WelcomeText>
      </Tooltip>
      <CircleContainer isLargeScreen={isLargeScreen}>
        {isStanding && <Ripple />}
        <Typography variant="h5" color="text.secondary">
          {formatTime(currentSessionTime)}
        </Typography>
      </CircleContainer>
      <StartStopButton
        variant="contained"
        color={isStanding ? 'secondary' : 'primary'}
        onClick={toggleStanding}
        startIcon={isStanding ? <Stop /> : <PlayArrow />}  
      >
        {isStanding ? t('stopStanding') : t('startStanding')}
      </StartStopButton>

      <StatsOverview
        formattedDailyTime={formattedDailyTime}
        formattedAverageTime={formattedAverageTime}
        formattedLongestTime={formattedLongestTime}
      />

    </Root>
  );
}

export default TimerPanel;
