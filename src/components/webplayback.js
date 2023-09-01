import React, { useState, useEffect, useRef } from 'react';
import PlayerCircle from './circles/playercircle';

function WebPlayback({ accessToken, onDeviceLoad, onPlayerActivation }) {
  const [currentTrack, setCurrentTrack] = useState({
    name: '',
    album: {
      images: [{ url: '' }]
    },
    artists: [{ name: '' }]
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const playerInstanceRef = useRef(null); // Initialize as null using useRef

  useEffect(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.head.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Circlefy',
          getOAuthToken: (cb) => {
            cb(accessToken);
          },
          volume: 0.5
        });
        playerInstanceRef.current = player; // Assign to the ref

        playerInstanceRef.current.addListener('ready', ({ device_id }) => {
          //console.log('Ready with Device ID', device_id);
          onDeviceLoad(device_id);
        });

        playerInstanceRef.current.addListener('not_ready', ({ device_id }) => {
          //console.log('Device ID has gone offline', device_id);
        });

        playerInstanceRef.current.addListener('player_state_changed', (state) => {
          if (!state) return;

          setCurrentTrack(state.track_window.current_track);
          setIsPaused(state.paused);

          playerInstanceRef.current.getCurrentState().then( state => { ;
            (!state)? setIsActive(false) : setIsActive(true) 
        });
        });
        playerInstanceRef.current.connect();

      };
    }
    // eslint-disable-next-line
  }, [accessToken]);

  const handlePlay = () => {
    playerInstanceRef.current.togglePlay();
  };
  const activatePlayer = () => {
    playerInstanceRef.current.activateElement();
    onPlayerActivation(true);
  };

  return (
    <>
      {isActive ? (
        <div className='now-playing-display'>
          <div className='now-playing-circle'>
            <PlayerCircle x='100' y='5' size="6" image={currentTrack.album.images[0].url} isPaused={isPaused} />
          </div>
          <div className="now-playing-info">
            <div className="now-playing-name">{currentTrack.name || 'Untitled'}</div>
            <div className="now-playing-artist">
              {currentTrack.artists[0].name}
            </div>
          </div>
          <div className='play-pause-container'>
            {isPaused ? (
              <button id="play-button" className="play-button" onClick={handlePlay}>
                <img className="play-icon" src="/images/play.png" alt="Play Icon" />
              </button>
            ) : (
                <button id="play-button" className="play-button" onClick={handlePlay}>
                  <img className="play-icon" src="/images/pause.png" alt="Pause Icon" />
                </button>
              )}
          </div>
        </div>
      ) : (
          <div className='inactive-player-display'>
            <button id='activate-player-button' className="activate-player-button" onClick={activatePlayer}>Click here to play your music</button>
          </div>
        )
      }
    </>
  );
}

export default WebPlayback;
