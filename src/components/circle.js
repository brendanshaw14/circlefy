// DynamicCircles.js
import React from 'react';

const Circle = ({ color, text, size }) => {
    return (
      <div>
        <svg width="100" height="100">
          <circle cx="50" cy="50" r="40" fill={color} />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="16">
            {text}
          </text>
        </svg>
      </div>
    );
  };

export default Circle;
