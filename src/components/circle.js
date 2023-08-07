import React from 'react';

const Circle = ({ color = "#000000", size = 100, image, text, scale = 1 }) => {
    const isImage = !!image;

    // Calculate the new x and y positions to center the image
    const x = (size - size * scale) / 2;
    const y = (size - size * scale) / 2;

    return (
        <svg width={size} height={size}>
            <defs>
                <clipPath id={'circle-clip'}>
                    <circle cx={size / 2} cy={size / 2} r={size / 2} />
                </clipPath>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
            {isImage ? (
                <image
                    x={x}
                    y={y}
                    width={size * scale}
                    height={size * scale}
                    href={image}
                    clipPath={`url(#${'circle-clip'})`}
                />
            ) : (
                <foreignObject x={x} y={y} width={size * scale} height={size * scale}>
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', overflowWrap: 'break-word' }}>
                        <p style={{ textAlign: 'center', color: 'white', fontSize: '16px' }}>
                            {text}
                        </p>
                    </div>
                </foreignObject>
            )}
        </svg>
    );
};

export default Circle;
