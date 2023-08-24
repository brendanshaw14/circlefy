import React from 'react';

const Circle = ({ color = "#000000", x = 0, y = 0, size = 0.1, image, text, scale = 1}) => {
    const isImage = !!image;

    // Convert percentage values to actual pixel values
    const stretch = (((visualViewport.width/visualViewport.height)-1)/2)+1;

    const actualX = (x / 100) * visualViewport.width;
    const actualY = (y / 100) * visualViewport.height*0.6;
    const actualSize = stretch*(size / 100)*visualViewport.height;

    return (
        <svg style={{position: 'absolute', left: actualX-actualSize/2, top: actualY-actualSize/2}} width={actualSize} height={actualSize}>
            <defs>
                <clipPath id={`circle-clip-${actualX}-${actualY}`}>
                    <circle cx={actualSize / 2} cy={actualSize / 2} r={actualSize / 2} />
                </clipPath>
            </defs>
            <circle cx={actualSize / 2} cy={actualSize / 2} r={actualSize / 2} fill={color} />
            {isImage ? (
                <image
                    x={(actualSize - actualSize * scale) / 2}
                    y={(actualSize - actualSize * scale) / 2}
                    width={actualSize * scale}
                    height={actualSize * scale}
                    href={image}
                    clipPath={`url(#circle-clip-${actualX}-${actualY})`}
                />
            ) : (
                <foreignObject x={0} y={0} width={actualSize} height={actualSize}>
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            overflowWrap: 'break-word',
                            color: 'white',
                            textAlign: 'center',
                            fontSize: `${actualSize * 0.10}px`,
                            padding: `${actualSize * 0.10}px`,
                        }}
                    >
                        <p>
                            {text}
                        </p>
                    </div>
                </foreignObject>
            )}
        </svg>
    );
};

export default Circle;
