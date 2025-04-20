import React, { useState, useEffect } from 'react';
import { Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import './DeskHeightCalculator.css';

const heightRangeCM = [
  [150, 56.5, 93.5],
  [151, 57, 94.5],
  [152, 57.5, 95],
  [153, 58, 95.5],
  [154, 58.5, 96.3],
  [155, 59, 97],
  [156, 59.8, 97.5],
  [157, 60.3, 98.3],
  [158, 60.8, 98.8],
  [159, 61.3, 99.5],
  [160, 62, 100.3],
  [161, 62.3, 101.3],
  [162, 62.8, 101.8],
  [163, 63.3, 102.5],
  [164, 63.8, 103.3],
  [165, 64.3, 103.5],
  [166, 64.8, 108],
  [167, 65.3, 108.5],
  [168, 67, 110],
  [169, 68, 110.8],
  [170, 68.5, 111.3],
  [171, 69, 112],
  [172, 69.5, 112.8],
  [173, 69.5, 113.3],
  [174, 70, 113.8],
  [175, 70, 114],
  [176, 70.3, 114.3],
  [177, 70.5, 114.8],
  [178, 71, 115],
  [179, 71.3, 115.5],
  [180, 71.5, 115.8],
  [181, 71.5, 116.5],
  [182, 72, 116.8],
  [183, 72.5, 117.5],
  [184, 72.8, 118],
  [185, 73.5, 118.5],
  [186, 74, 119.3],
  [187, 74.5, 120],
  [188, 75, 120.3],
  [189, 75.5, 120.8],
  [190, 76, 122],
  [191, 77, 122.3],
  [192, 77.5, 123],
  [193, 78, 123.5],
  [194, 78.3, 123.8],
  [195, 79, 124.3],
  [196, 79.3, 124.8],
  [197, 79.8, 125.3],
  [198, 80, 125.5],
  [199, 80.3, 125.8],
  [200, 81, 126.3],
  [201, 82, 126.5],
  [202, 82.5, 127.3],
  [203, 83, 128],
  [204, 83.3, 128.3],
  [205, 84, 128.5]
];

const DeskHeightCalculator = () => {
  const [height, setHeight] = useState(150);
  const [type, setType] = useState(0); // 0 für sitting, 1 für standing
  const [deskHeight, setDeskHeight] = useState(56.5);
  const [sittingHeight, setSittingHeight] = useState(56.5);
  const [standingHeight, setStandingHeight] = useState(93.5);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  useEffect(() => {
    const heightRange = heightRangeCM.find(sub => sub[0] === height);
    
    if (heightRange) {
      setSittingHeight(heightRange[1]);
      setStandingHeight(heightRange[2]);
      showDeskHeight(height, type);
    }
  }, [height, type]);

  const showDeskHeight = (person_height, type) => {
    const heightRange = heightRangeCM.find(sub => sub[0] === person_height);
    
    if (!heightRange) {
      return; // Wenn kein passender Wert gefunden wurde, machen wir nichts
    }

    const minHeight = 56.5;
    const maxHeight = type === 1 ? heightRange[2] : heightRange[1];
    
    let diffHeight = maxHeight * 349 / minHeight - 349;
    let scale = ((maxHeight * 349 / minHeight) * 100 / 349) / 100;
    
    setDeskHeight(maxHeight);
    
    // Nur DOM manipulieren wenn Large Screen
    if (isLargeScreen) {
      const legs = document.getElementById("desk__legs");
      const deskTop = document.getElementById("desk__top");
      const indicatorBox = document.getElementById("indicator__box");
      if (legs) legs.style.transform = `scaleY(${scale})`;
      if (deskTop) deskTop.style.marginTop = `-${diffHeight}px`;
      if (indicatorBox) indicatorBox.style.height = `${scale * 100}%`;
    }
  };

  const handleHeightChange = (e) => {
    setHeight(parseInt(e.target.value));
  };

  return (
    <Box
      className="container"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', 
      }}
    >
      {isLargeScreen ? (
        <Box
          className="preview"
          sx={{
            flex: 1,
            minHeight: 300,
            overflow: 'hidden', 
          }}
        >
          <div className="desk">
            <div className="desk__dynamic_part">
              <div id="desk__top">
                <svg width="971" height="109" viewBox="0 0 971 109" fill="none" xmlns="http://www.w3.org/2000/svg" className="desk__top">
                  <path d="M2.55793 81.5526L64.8983 3.62713C66.2267 1.96663 68.2379 1 70.3644 1H896.709C898.794 1 900.77 1.92888 902.099 3.53388L969.186 84.5C970.495 86.0803 970.325 88.313 969.005 89.6484L968.669 99.1842C968.567 102.084 966.693 104.651 963.91 105.473C957.445 107.383 953.095 107.838 946.5 108H19.5C13.2072 107.838 9.84053 107.387 5.58751 105.763C3.04995 104.794 1.5 102.265 1.5 99.5487V88.4325C0.867734 86.8712 0.846179 85.0445 1.5 83.3789C1.75149 82.7382 2.10291 82.1214 2.55793 81.5526Z" fill="#E6E6E6" />
                  <path d="M1.5 83V99.5487C1.5 102.265 3.04995 104.794 5.58751 105.763C9.84053 107.387 13.2072 107.838 19.5 108H946.5C953.095 107.838 957.445 107.383 963.91 105.473C966.693 104.651 968.567 102.084 968.669 99.1842L969.186 84.5M969.186 84.5V84.5C970.846 86.5035 970.128 89.5555 967.703 90.4985C962.085 92.6833 958.269 93.4586 953 93.5H16C11.8929 93.5473 8.73514 93.0698 5.2121 91.9102C0.906794 90.4931 -0.27352 85.0919 2.55793 81.5526L64.8983 3.62713C66.2267 1.96663 68.2379 1 70.3644 1H896.709C898.794 1 900.77 1.92888 902.1 3.53388L969.186 84.5Z" stroke="black" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="desk__control">
                  <div className="desk__control__top">
                    <div className="desk__control__display" id="desk__control__display">{deskHeight.toFixed(1)}</div>
                    <button><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg></button>
                    <button><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg></button>
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                  </div>
                  Autonomous
                </div>
              </div>
              <svg width="775" height="349" viewBox="0 0 775 349" fill="none" xmlns="http://www.w3.org/2000/svg" id="desk__legs" className="desk__legs">
                <path d="M10.5 348.5L1 0.5H30.5H40L47.5 333.5L40 348.5H10.5Z" fill="white" />
                <path d="M774.5 0.5L763.5 348.5H736.5L727.5 333.5L736.5 0.5H744.5H774.5Z" fill="white" />
                <path d="M40 348.5H10.5L1 0.5H30.5M40 348.5L30.5 0.5M40 348.5L47.5 333.5L40 0.5H30.5M736.5 348.5H763.5L774.5 0.5H744.5M736.5 348.5L744.5 0.5M736.5 348.5L727.5 333.5L736.5 0.5H744.5" stroke="black" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="indicator_height" id="indicator__box">
              <hr />
              <div id="indicator">{deskHeight.toFixed(1)}</div>
            </div>
            <svg width="808" height="125" viewBox="0 0 808 125" fill="none" xmlns="http://www.w3.org/2000/svg" className="desk__legs__bottom">
              <path d="M63.5 2.5H84V10L44.5 124H0.5V110L25 47L63.5 2.5Z" fill="white" />
              <path d="M84 2.5H63.5L25 47L0.5 110M84 2.5L44.5 110M84 2.5V10L44.5 124M44.5 110H0.5M44.5 110V124M0.5 110V124H44.5" stroke="black" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M721.5 0.5H744L780 46L807 110V123.5H763.5L721.5 10V0.5Z" fill="white" />
              <path d="M721.5 0.5H744L780 46L807 110M721.5 0.5L763.5 110M721.5 0.5V10L763.5 123.5M763.5 110H807M763.5 110V123.5M807 110V123.5H763.5" stroke="black" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Box>
      ) :  
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Recommended desk heights:</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">Sitting:</Typography>
        <Typography variant="body1" fontWeight="bold">{sittingHeight.toFixed(1)} cm</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body1">Standing:</Typography>
        <Typography variant="body1" fontWeight="bold">{standingHeight.toFixed(1)} cm</Typography>
      </Box>
      <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          Current setting ({type === 0 ? 'Sitting' : 'Standing'}): 
          <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>
            {deskHeight.toFixed(1)} cm
          </span>
        </Typography>
      </Box>
    </Box>} 
      <Box className="form" sx={{ mt: 2 }}>
        <div className="form_group">
          <Typography component="label" htmlFor="height">Your height (cm)</Typography>
          <input 
            type="number"
            id="height" 
            name="height" 
            value={height} 
            onChange={handleHeightChange}
            min="150"
            max="205"
          />
        </div>
        <div className="form_group">
          <Typography component="label" htmlFor="type">Position at desk</Typography>
          <select id="type" value={type} onChange={(e) => setType(Number(e.target.value))}>
            <option value={0}>Sitting</option>
            <option value={1}>Standing</option>
          </select>
        </div>
      </Box>
    </Box>
  );
};

export default DeskHeightCalculator;