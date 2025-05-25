import { useState, useEffect } from 'react';
import heightRangeCM from '../utils/heightRange';

/**
 * Hook to compute desk, sitting, and standing heights and update DOM for preview.
 * @param {number} personHeight - User's height in cm.
 * @param {0|1} type - 0 for sitting, 1 for standing.
 * @param {boolean} isLargeScreen - Whether to apply visual preview.
 * @returns {{ deskHeight: number, sittingHeight: number, standingHeight: number }}
 */
function useDeskHeight(personHeight, type, isLargeScreen) {
  const [deskHeight, setDeskHeight] = useState(56.5);
  const [sittingHeight, setSittingHeight] = useState(56.5);
  const [standingHeight, setStandingHeight] = useState(93.5);

  useEffect(() => {
    const range = heightRangeCM.find(r => r[0] === personHeight);
    if (!range) return;
    const sitH = range[1];
    const standH = range[2];
    setSittingHeight(sitH);
    setStandingHeight(standH);
    const targetH = type === 1 ? standH : sitH;
    setDeskHeight(targetH);

    if (isLargeScreen) {
      const minHeight = 56.5;
      const maxHeight = targetH;
      const diffHeight = maxHeight * 349 / minHeight - 349;
      const scale = ((maxHeight * 349 / minHeight) * 100 / 349) / 100;
      const legs = document.getElementById("desk__legs");
      const deskTop = document.getElementById("desk__top");
      const indicatorBox = document.getElementById("indicator__box");
      if (legs) legs.style.transform = `scaleY(${scale})`;
      if (deskTop) deskTop.style.marginTop = `-${diffHeight}px`;
      if (indicatorBox) indicatorBox.style.height = `${scale * 100}%`;
    }
  }, [personHeight, type, isLargeScreen]);

  return { deskHeight, sittingHeight, standingHeight };
}

export default useDeskHeight;
