import { useState, useEffect } from 'react';
import heightRangeCM from '../utils/heightRange';

/**
 * Hook to compute desk, sitting, and standing heights.
 * @param {number} personHeight - User's height in cm.
 * @param {0|1} type - 0 for sitting, 1 for standing.
 * @returns {{ deskHeight: number, sittingHeight: number, standingHeight: number, scale: number, offsetPx: number }}
 */
export default function useDeskHeight(personHeight, type) {
  const [deskHeight, setDeskHeight] = useState(56.5);
  const [sittingHeight, setSittingHeight] = useState(56.5);
  const [standingHeight, setStandingHeight] = useState(93.5);
  const [scale, setScale] = useState(1);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    const range = heightRangeCM.find(r => r[0] === personHeight);
    if (!range) return;
    const sitH = range[1];
    const standH = range[2];
    setSittingHeight(sitH);
    setStandingHeight(standH);
    const targetH = type === 1 ? standH : sitH;
    setDeskHeight(targetH);

    // Compute transform scale and vertical offset for rendering
    const minHeight = 56.5;
    const maxHeight = targetH;
    const newOffsetPx = maxHeight * 349 / minHeight - 349;
    const newScale = ((maxHeight * 349 / minHeight) * 100 / 349) / 100;
    setOffsetPx(newOffsetPx);
    setScale(newScale);
  }, [personHeight, type]);

  return { deskHeight, sittingHeight, standingHeight, scale, offsetPx };
}
