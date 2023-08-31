import React from 'react';
import '../../pages/home/home.scss'

const PlayerCircle = ({ color = "#000000", x = 0, y = 0, size = 0.1, image, text, scale = 1.1, delay = 0, label, song, isPaused}) => {

    const actualX = (visualViewport.width/2)-(0.1*visualViewport.height);
    const actualY = (y / 100) * visualViewport.height;
    const actualSize = (size / 100)*visualViewport.height;

    const animationStyle = {
        animation: isPaused ? '': 'rotate 10s linear infinite'
    }

    return (
        <div style={{ textAlign: 'center', justifyContent: 'center', width: '0px', height: '0px' }}>
            <svg style={{ ...animationStyle, position: 'absolute', left: actualX-actualSize/2, top: actualY-actualSize/2}} width={actualSize} height={actualSize}>
                <defs>
                    <clipPath id={`circle-clip-${actualX}-${actualY}`}>
                        <circle cx={actualSize / 2} cy={actualSize / 2} r={actualSize / 2} />
                    </clipPath>
                </defs>
                <circle cx={actualSize / 2} cy={actualSize / 2} r={actualSize / 2} fill={color} />
                    <image
                        x={(actualSize - actualSize * scale) / 2}
                        y={(actualSize - actualSize * scale) / 2}
                        width={actualSize * scale}
                        height={actualSize * scale}
                        href={image}
                        clipPath={`url(#circle-clip-${actualX}-${actualY})`}
                    />
            </svg>
        </div> 
    );
};

export default PlayerCircle;
