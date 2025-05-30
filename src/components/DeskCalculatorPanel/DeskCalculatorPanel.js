import { StyledCalculatorPanel } from './DeskCalculatorPanel.styles';
import DeskHeightCalculator from '../DeskHeightCalculator/DeskHeightCalculator';

/**
 * Panel wrapping the desk height calculator.
 */
function DeskCalculatorPanel() {
  return (
    <StyledCalculatorPanel elevation={3}>
      <DeskHeightCalculator />
    </StyledCalculatorPanel>
  );
}

export default DeskCalculatorPanel;
