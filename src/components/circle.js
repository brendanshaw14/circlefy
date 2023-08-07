import React from 'react';

const Circle = ({ color = "#000000", x = 0, y = 0, size = 0.1, image, text, scale = 1 }) => {
    const isImage = !!image;

    // Convert percentage values to actual pixel values
    const actualX = (x/100) * window.innerWidth;
    const actualY = (y/100) * window.innerHeight;
    const actualSize = Math.min(window.innerWidth, window.innerHeight) * (size / 100);


    return (
        <svg x={actualX} y={actualY} width={actualSize} height={actualSize}>
            <defs>
                <clipPath id={`circle-clip-${actualX}-${actualY}`}>
                    <circle cx={actualSize / 2} cy={actualSize / 2} r={actualSize / 2} />
                </clipPath>
            </defs>
            <circle cx={actualSize / 2} cy={actualSize / 2} r={actualSize / 2} fill={color} />
            {isImage ? (
                <image
                    x={(actualSize-actualSize*scale)/2}
                    y={(actualSize-actualSize*scale)/2}
                    width={actualSize*scale}
                    height={actualSize*scale}
                    href={image}
                    clipPath={`url(#circle-clip-${actualX}-${actualY})`}
                />
            ) : (
                <foreignObject x={0} y={0} width={actualSize} height={actualSize}>
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            position: 'absolute', 
                            overflowWrap: 'break-word',
                            color: 'white',
                            textAlign: 'center',
                            fontSize: `${actualSize*0.10}px`,
                            padding: `${actualSize*0.10}px`,
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
