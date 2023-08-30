import React, { useState, useEffect } from 'react';
import PopCircle from './circles/popcircle';

function WebPlayback({accessToken, onDeviceLoad}) {
  const [currentTrack, setCurrentTrack] = useState({
    name: '',
    album: {
      images: [{ url: '' }]
    },
    artists: [{ name: '' }]
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!window.Spotify){
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.head.appendChild(script);

      console.log(accessToken);
      window.onSpotifyWebPlaybackSDKReady = () => {
        const playerInstance = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: (cb) => {
            cb(accessToken);
          },
          volume: 0.5
        });


        playerInstance.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          onDeviceLoad(device_id);
        });

        playerInstance.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        playerInstance.addListener('player_state_changed', (state) => {
          if (!state) return;

          setCurrentTrack(state.track_window.current_track);
          setIsPaused(state.paused);

          playerInstance.getCurrentState().then((state) => {
            setIsActive(!!state);
          });
        });

        playerInstance.connect();
      };
    }
  // eslint-disable-next-line
  }, [accessToken]);
  
  return (
    <>
      <PopCircle x='45' y='0' size="5" image= {currentTrack.album.images[0].url}/>
      <div className="now-playing-info">
        <div className="now-playing-name">{currentTrack.name || 'Untitled'}</div>
        <div className="now-playing-artist">
          {currentTrack.artists[0].name}
        </div>

        <div className="now-playing-status">
          {isActive ? (isPaused ? 'Paused' : 'Playing') : 'Not Active'}
        </div>
      </div>
    </>
  );
}

export default WebPlayback;
