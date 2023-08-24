import React, { useState, useEffect } from 'react';

function WebPlayback(props) {
  const [currentTrack, setCurrentTrack] = useState({
    name: '',
    album: {
      images: [{ url: '' }]
    },
    artists: [{ name: '' }]
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  console.log(props.token);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.head.appendChild(script);

    console.log(props.token);
    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5
      });


      playerInstance.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
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
  }, [props.token]);

  return (
    <>
      <div className="container">
        <div className="main-wrapper">
          <img
            //src={currentTrack.album.images[0].url}
            className="now-playing__cover"
            alt=""
          />

          <div className="now-playing__side">
            <div className="now-playing__name">{currentTrack.name}</div>

            <div className="now-playing__artist">
              {currentTrack.artists[0].name}
            </div>

            <div className="now-playing__status">
              {isActive ? (isPaused ? 'Paused' : 'Playing') : 'Not Active'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WebPlayback;
