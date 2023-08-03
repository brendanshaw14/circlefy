import React from 'react';

const Circle = ({ color = "#000000", size = 100, image, text, scale = 1}) => {
    const isImage = !!image;
    const clipPathId = "circle-clip"; // Define the clipPathId as a unique string

    // Calculate the new x and y positions to center the image
    const x = (size - size * scale) / 2;
    const y = (size - size * scale) / 2;

    return (
        <svg width={size} height={size}>
            <defs>
                <clipPath id={clipPathId}>
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
            clipPath={`url(#${clipPathId})`}
            preserveAspectRatio="xMidyMid meet"
            />
        ) : (
            <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="16"
            >
            {text}
            </text>
        )}
        </svg>
    );
};

export default Circle;
