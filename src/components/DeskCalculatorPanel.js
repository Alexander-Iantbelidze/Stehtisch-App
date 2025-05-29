import React from 'react';
import { Paper } from '@mui/material';
import DeskHeightCalculator from './DeskHeightCalculator/DeskHeightCalculator';

/**
 * Panel wrapping the desk height calculator.
 */
function DeskCalculatorPanel() {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: { lg: 650, xl: 'none' },
        overflow: 'hidden',
      }}
    >
      <DeskHeightCalculator />
    </Paper>
  );
}

export default DeskCalculatorPanel;
