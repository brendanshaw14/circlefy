import React, {useState, useEffect} from 'react';
import '../../pages/home/home.scss'

const PopCircle = ({ color = "#000000", x = 0, y = 0, size = 0.1, image, text, scale = 1.1, delay = 0, label, song, artist, clickHandler}) => {
    const [isVisible, setIsVisible] = useState(false);
    const isImage = (song ? true : false) || (artist ? true: false);
    const stretch = (((visualViewport.width/visualViewport.height)-1)/2)+1;

    const actualX = (x / 100) * visualViewport.width;
    const actualY = (y / 100) * visualViewport.height*0.8;
    const actualSize = stretch*(size / 100)*visualViewport.height;

    const animationStyle = {
        animation: 'pop-in 0.2s ease-in, circlePulse 4s infinite ease-in-out 0.2s', 
    }


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsVisible(true);
        }, delay * 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [delay]);

    return (
        isVisible &&( 
        <div style={{ textAlign: 'center', justifyContent: 'center', width: '0px', height: '0px' }}>
            <svg style={{ ...animationStyle, position: 'absolute', left: actualX-actualSize/2, top: actualY-actualSize/2}} width={actualSize} height={actualSize} onClick={clickHandler ? () => clickHandler(song) : undefined}>
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
                        href={artist? (artist.images[0].url):(song.album.images[0].url)}
                        clipPath={`url(#circle-clip-${actualX}-${actualY})`}
                    />
                ) : (
                    <foreignObject x={0} y={0} width={actualSize} height={actualSize}>
                        <div className='circle-text-container'
                            xmlns="http://www.w3.org/1999/xhtml"
                            style={{
                                overflowWrap: 'break-word',
                                color: 'white',
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
            <div
                style={{
                    ...animationStyle,
                    position: 'absolute', // Set position to absolute
                    width: `${actualSize}px`, 
                    top: `${actualY+actualSize/2}px`, // Adjust this value to control the vertical position
                    left: `${actualX-actualSize/2}px`, 
                    fontSize: `${actualSize * 0.10}px`,
                    marginTop: '20px',
                    color: 'white',
                    textAlign: 'center',
                    justifyContent: 'center'
                }}
            >
                {label}
            </div>
        </div> 
        )
    );
};

export default PopCircle;
