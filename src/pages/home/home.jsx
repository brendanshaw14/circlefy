import "./home.scss";
import FadeCircle from "../../components/circles/fadecircle";
import PopCircle from "../../components/circles/popcircle";
import React, {useState, useEffect} from 'react';
import { createRoot } from 'react-dom/client';
import WebPlayback from "../../components/webplayback";


const clientId = 'a27fb42203c6414fa9076b4f545bc38a';
const redirectUri = 'http://localhost:3000/home/';

let username; 
let artistData;
let trackData;
let deviceId;



const Home = () => {

    const handleClick = (song) => {
        playTrack(accessToken, song, deviceId)
    }
    const renderFunctions = [
        () => renderTracksContainer(trackData, handleClick), 
        () => renderTracksContainer2(trackData, handleClick), 
        () => renderArtistsContainer(artistData, accessToken, handleClick), 
        () => renderArtistsContainer2(artistData, accessToken, handleClick),
    ];
    const [accessToken, setAccessToken] = useState(null);
    const [playerActivated, setPlayerActivated] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        init()
            .then((accessToken) => {
            setAccessToken(accessToken);
            })
            .catch((error) => {
            console.error('Error during initialization:', error);
            });
        
    }, []);
    let maxIndex = 0;
    //call the init function to check and update the access token, then use the promise to fetch and store data  
    if (accessToken && (!playerActivated)) {
        const profilePromise = getProfile(accessToken);
        const artistsPromise = getArtists(accessToken);
        const tracksPromise = getTracks(accessToken);

        Promise.all([profilePromise, artistsPromise, tracksPromise])
        .then(([profileData, artistsData, tracksData]) => {
            username = profileData.display_name;
            artistData = artistsData;
            trackData = tracksData;
            console.log(profileData, artistData, trackData);
            renderIntroContainer(artistData, username, accessToken, handleClick);
        })
        .catch(error => {
            console.error('Error fetching data');
        });
    }
    if (accessToken){
        //scroll handling function: determine which container is rendered by dividing scroll distance by container height
        window.addEventListener('scroll', () => {
            const scrolly = window.scrollY;
            const windowHeight = window.innerHeight;
            const index = Math.floor((scrolly+(windowHeight*0.3))/(windowHeight*0.9));
            if (index > maxIndex){
                maxIndex = index;
                renderFunctions[index-1]();
                if (playerActivated){
                    console.log("Play track: " + index-1);
                    playTrack(accessToken, trackData.items[index-1], deviceId);
                }
            }
        }); 
    }

    const handleIdLoad = (newDeviceId) => {
        deviceId = newDeviceId; 
    };

    const onPlayerActivation = (activated) => {
        setPlayerActivated(activated); 
    };

    

    useEffect(() => {
        if (playerActivated){
            playTrack(accessToken, trackData.items[9], deviceId);
        }
        else{
            console.log("player not activated");
        }
        // eslint-disable-next-line
    }, [playerActivated]);

    return (
        <div className="home">
            <header className="header-container"> 
                <h1 className="title">Circlefy</h1>
            </header>
            <main className="body-container"> 
                <div className="intro-container"></div>
                <div className="tracks-container">
                </div>
                <div className="tracks-container-2"></div>
                <div className="artist-container"></div>
                <div className="artist-container-2"></div>
            </main>
            <div className="player-container">
                {accessToken && (
                    <WebPlayback accessToken={accessToken} onDeviceLoad={handleIdLoad} onPlayerActivation={onPlayerActivation}/>
                )}
            </div>
            <footer className="footer-container">
                <div className="name">
                    <span>by Brendan Shaw</span>
                </div>
                <div className="github">
                    <a href="https://github.com/brendanshaw14" target="_blank" rel="noopener noreferrer" className="link">
                        <img src="/images/github.png" alt="GitHub" className="github-icon" />
                        GitHub
                    </a>
                </div>
                <div className="linkedIn">
                    <a href="https://www.linkedin.com/in/brendanshaw14" target="_blank" rel="noopener noreferrer" className="link">
                        <img src="/images/linkedin.png" alt="LinkedIn" className="linkedIn-icon" />
                        LinkedIn
                    </a>
                </div>
            </footer>
        </div>
      );
}

export default Home
/*************************function definitions*************************/

//checks and updates accessToken
async function init(){
        let accessToken = localStorage.getItem('access_token');
        if (!accessToken){
            //console.log("no access token, getting token");
            accessToken = await getAccessToken();
        }
        else if (!verifyAccessToken(accessToken)){
            //console.log("token expired: refreshing token")
            accessToken = await refreshAccessToken();
        }
        else{
            //console.log("token exists and was validated")
        }
        return accessToken
}

//retrieves the accesstoken from the SpotifyAPI
async function getAccessToken() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        let codeVerifier = localStorage.getItem('code_verifier');
        let body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier
        });
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('expires_in', data.expires_in);
        // Calculate the expiration time in milliseconds from the 'expires_in' value
        const expiresInMilliseconds = localStorage.getItem('expires_in') * 1000;
        // Calculate the expiration timestamp and save it in local storage
        const expirationTimestamp = Date.now() + expiresInMilliseconds;
        localStorage.setItem('expires_at', new Date(expirationTimestamp).toISOString());
        return data.access_token;
    } catch (error) {
        console.error('Error:', error);
    }
}

//uses the refresh token to obtain a new access token
async function refreshAccessToken(accessToken) {
    try{
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
        throw new Error('No refresh token found in local storage.');
        }
        const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        });
        return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
        })
        .then((response) => {
            if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
            }
            return response.json();
        })
        .then((data) => {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('expires_in', data.expires_in);
            // Calculate the expiration time in milliseconds from the 'expires_in' value
            const expiresInMilliseconds = localStorage.getItem('expires_in') * 1000;
            // Calculate the expiration timestamp and save it in local storage
            const expirationTimestamp = Date.now() + expiresInMilliseconds;
            localStorage.setItem('expires_at', new Date(expirationTimestamp).toISOString());
            return data.access_token;
        })
    }catch(error){
        console.error('Error refreshing access token:', error);
    }
}

//uses the locally stored 'expires_at' value to determine whether or not the access token is still valid
function verifyAccessToken() {        
    const expires_at = localStorage.getItem('expires_at');
    // Parse the expiration time from ISO 8601 format
    const expirationTimestamp = Date.parse(expires_at);
    // Get the current timestamp
    const currentTimestamp = Date.now();
    // Compare the current timestamp with the expiration timestamp
    return currentTimestamp <= expirationTimestamp;
} 


//profile data retreive definition
async function getProfile(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
        Authorization: 'Bearer ' + accessToken
    }
    });
    const data = await response.json();
    return data; // Return the user's data from the Spotify API
}

//artist data retreive definition
async function getArtists(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=short_term', {
    headers: {
        Authorization: 'Bearer ' + accessToken
    }
    });
    const data = await response.json();
    return data; // Return the user's data from the Spotify API
}

//artist data retreive definition
async function getTracks(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term', {
    headers: {
        Authorization: 'Bearer ' + accessToken
    }
    });
    const data = await response.json();
    return data; // Return the user's data from the Spotify API
}


async function renderIntroContainer(artistData, username, accessToken, handleClick){
    try{
        const artists = artistData.items.map(artist => artist); 
        const topSongs = await Promise.all(artistData.items.map(artist => getArtistTopSong(accessToken, artist)));
        createRoot(document.querySelector('.intro-container')).render(

            <div>
                <FadeCircle x = '40' y = '45' size = '40' color="#a8df85" text={`Hello, ${username}`} /> 
                <FadeCircle x = '10' y = '10' size = "18" artist={artists[7]} song={topSongs[7]} delay='0.5' clickHandler={handleClick}/>
                <FadeCircle x = '30' y = '95' size = "6" artist={artists[2]} song={topSongs[2]} delay='0.6' clickHandler={handleClick}/>
                <FadeCircle x = '18' y = '35' size = "8" artist={artists[5]} song={topSongs[5]} delay='0.7' clickHandler={handleClick}/>
                <FadeCircle x = '15' y = '80' size = "25" artist={artists[0]} song={topSongs[0]} delay='0.8'clickHandler={handleClick}/>
                <FadeCircle x = '60' y = '85' size = "12" artist={artists[14]} song={topSongs[14]} delay='0.9' clickHandler={handleClick}/>
                <FadeCircle x = '90' y = '92' size = "15"artist={artists[4]} song={topSongs[4]} delay='1.0' clickHandler={handleClick}/>
                <FadeCircle x = '64' y = '15' size = "8" artist={artists[8]} song={topSongs[8]} delay='1.1' clickHandler={handleClick}/>
                <FadeCircle x = '90' y = '15' size = "15" artist={artists[1]} song={topSongs[1]} delay='1.2' clickHandler={handleClick}/>
                <FadeCircle x = '75' y = '55' size = "27" color="#399fec" text={"Tap circles to hear your music. Scroll down to begin"} delay='1.7'/>
            </div>, 
        );
    }
    catch (error){
        console.log(error);
    }
}

//renders the components of the tracks container
function renderTracksContainer(trackData, handleClick) {
    try {
        createRoot(document.querySelector('.tracks-container')).render(
            <div>
                <FadeCircle x="50" y="15" size="30" color="#ffe80b" text={`This month, your top tracks were:`} />
                <PopCircle x="10" y="70" size="15" label={`1. ${trackData.items[0].name}- ${trackData.items[0].artists[0].name}`} delay="7" song={trackData.items[0]} clickHandler={handleClick}/>
                <PopCircle x="30" y="70" size="15" label={`2. ${trackData.items[1].name}- ${trackData.items[1].artists[0].name}`} delay="6" song={trackData.items[1]} clickHandler={handleClick}/>
                <PopCircle x="50" y="70" size="15" label={`3. ${trackData.items[2].name}- ${trackData.items[2].artists[0].name}`} delay="5" song={trackData.items[2]} clickHandler={handleClick}/>
                <PopCircle x="70" y="70" size="15" label={`4. ${trackData.items[3].name}- ${trackData.items[3].artists[0].name}`} delay="4" song={trackData.items[3]} clickHandler={handleClick}/>
                <PopCircle x="90" y="70" size="15" label={`5. ${trackData.items[4].name}- ${trackData.items[4].artists[0].name}`} delay="3" song={trackData.items[4]} clickHandler={handleClick}/>
            </div>
        );
    } catch (error) {
        console.log(error);
    }
}


//renders the components of the tracks container
function renderTracksContainer2(trackData, handleClick){
    const tracks = trackData.items.map(track => track); //save top artist images in array
    const songNames = trackData.items.map(track => track.name); //save top artist images in array
    const artistNames = trackData.items.map(track => track.artists[0]?.name || "Unknown Artist"); //save top artist images in array
    createRoot(document.querySelector('.tracks-container-2')).render(
        <div>
            <FadeCircle x = '50' y = '25' size = '30' color="#ff9f3d" text={`And some honorable mentions:`}/> 
            <PopCircle x = '12' y = '10' size = "15" label={`6. ${songNames[5]}- ${artistNames[5]}`} delay='2.3' song={tracks[5]} clickHandler={handleClick}/>
            <PopCircle x = '12' y = '55' size = "14" label={`7. ${songNames[6]}- ${artistNames[6]}`} delay='2.3' song={tracks[6]} clickHandler={handleClick}/>
            <PopCircle x = '25' y = '28' size = "12" label={`8. ${songNames[7]}- ${artistNames[7]}`} delay='2.4' song={tracks[7]} clickHandler={handleClick}/>
            <PopCircle x = '35' y = '57' size = "11" label={`9. ${songNames[8]}- ${artistNames[8]}`} delay='2.5' song={tracks[8]} clickHandler={handleClick}/>
            <PopCircle x = '22' y = '80' size = "13" label={`10. ${songNames[9]}- ${artistNames[9]}`} delay='2.6' song={tracks[9]} clickHandler={handleClick}/>
            <PopCircle x = '49' y = '75' size = "15" label={`11. ${songNames[10]}- ${artistNames[10]}`} delay='2.7' song={tracks[10]} clickHandler={handleClick}/>
            <PopCircle x = '33' y = '0' size = "10" label={`12. ${songNames[11]}- ${artistNames[11]}`} delay='2.8' song={tracks[11]} clickHandler={handleClick}/>
            <PopCircle x = '72' y = '8' size = "13" label={`13. ${songNames[12]}- ${artistNames[12]}`} delay='2.9' song={tracks[12]} clickHandler={handleClick}/>
            <PopCircle x = '65' y = '53' size = "14" label={`14. ${songNames[13]}- ${artistNames[13]}`} delay='3.0' song={tracks[13]} clickHandler={handleClick}/>
            <PopCircle x = '79' y = '75' size = "13" label={`15. ${songNames[14]}- ${artistNames[14]}`} delay='3.1' song={tracks[14]} clickHandler={handleClick}/>
            <PopCircle x = '64' y = '92' size = "9" label={`16. ${songNames[15]}- ${artistNames[15]}`} delay='3.2' song={tracks[15]} clickHandler={handleClick}/>
            <PopCircle x = '92' y = '88' size = "12" label={`17. ${songNames[16]}- ${artistNames[16]}`} delay='3.3' song={tracks[16]} clickHandler={handleClick}/>
            <PopCircle x = '80' y = '38' size = "11" label={`18. ${songNames[17]}- ${artistNames[17]}`} delay='3.4' song={tracks[17]} clickHandler={handleClick}/>
            <PopCircle x = '88' y = '10' size = "12" label={`19. ${songNames[18]}- ${artistNames[18]}`} delay='3.5' song={tracks[18]} clickHandler={handleClick}/>
            <PopCircle x = '91' y = '55' size = "10" label={`20. ${songNames[19]}- ${artistNames[19]}`} delay='3.6' song={tracks[19]} clickHandler={handleClick}/>
        </div>
    );
}

//renders the components of the artists container
async function renderArtistsContainer(artistData, accessToken, handleClick){
    const topSongs = await Promise.all(artistData.items.map(artist => getArtistTopSong(accessToken, artist)));
    createRoot(document.querySelector('.artist-container')).render(
        <div>
            <FadeCircle x = '50' y = '15' size = '30' color="#ff59b5" text={`Now on to your favorite artists: Here's who you had on repeat.`}/> 
            <PopCircle x = '10' y = '75' size = '15' label={`1. ${artistData.items[0].name}`} delay='5.5' artist={artistData.items[0]} song={topSongs[0]} clickHandler={handleClick}/> 
            <PopCircle x = '30' y = '75' size = '15' label={`2. ${artistData.items[1].name}`} delay='4.5' artist={artistData.items[1]} song={topSongs[1]} clickHandler={handleClick}/> 
            <PopCircle x = '50' y = '75' size = '15' label={`3. ${artistData.items[2].name}`} delay='3.5' artist={artistData.items[2]} song={topSongs[2]} clickHandler={handleClick}/> 
            <PopCircle x = '70' y = '75' size = '15' label={`4. ${artistData.items[3].name}`} delay='2.5' artist={artistData.items[3]} song={topSongs[3]} clickHandler={handleClick}/> 
            <PopCircle x = '90' y = '75' size = '15' label={`5. ${artistData.items[4].name}`} delay='1.5' artist={artistData.items[4]} song={topSongs[4]} clickHandler={handleClick}/> 
        </div>
    );
}

//renders the components of the tracks container
async function renderArtistsContainer2(artistData, accessToken, handleClick){
    const artists = artistData.items.map(artist => artist); //save top artist images in array
    const topSongs = await Promise.all(artistData.items.map(artist => getArtistTopSong(accessToken, artist)));
    const artistNames = artistData.items.map(artist => artist.name || "Unknown Artist"); //save top artist images in array
    createRoot(document.querySelector('.artist-container-2')).render(
        <div>
            <FadeCircle x = '50' y = '25' size = '30' color="#399fec" text={`And a few others...`}/> 
            <PopCircle x = '12' y = '10' size = "15" label={`6. ${artistNames[5]}`} delay='2.3' song={topSongs[5]} artist={artists[5]} clickHandler={handleClick}/>
            <PopCircle x = '12' y = '55' size = "14" label={`7.  ${artistNames[6]}`} delay='2.3' song={topSongs[6]} artist={artists[6]} clickHandler={handleClick}/>
            <PopCircle x = '28' y = '28' size = "12" label={`8.  ${artistNames[7]}`} delay='2.4' song={topSongs[7]} artist={artists[7]} clickHandler={handleClick}/>
            <PopCircle x = '35' y = '60' size = "14" label={`9.  ${artistNames[8]}`} delay='2.5' song={topSongs[8]} artist={artists[8]} clickHandler={handleClick}/>
            <PopCircle x = '22' y = '80' size = "13" label={`10.  ${artistNames[9]}`} delay='2.6' song={topSongs[9]} artist={artists[9]} clickHandler={handleClick}/>
            <PopCircle x = '49' y = '75' size = "15" label={`11.  ${artistNames[10]}`} delay='2.7' song={topSongs[10]} artist={artists[10]} clickHandler={handleClick}/>
            <PopCircle x = '33' y = '0' size = "10" label={`12.  ${artistNames[11]}`} delay='2.8' song={topSongs[11]} artist={artists[11]} clickHandler={handleClick}/>
            <PopCircle x = '72' y = '8' size = "13" label={`13.  ${artistNames[12]}`} delay='2.9' song={topSongs[12]} artist={artists[12]} clickHandler={handleClick}/>
            <PopCircle x = '65' y = '53' size = "14" label={`14.  ${artistNames[13]}`} delay='3.0' song={topSongs[13]} artist={artists[13]} clickHandler={handleClick}/>
            <PopCircle x = '79' y = '85' size = "13" label={`15.  ${artistNames[14]}`} delay='3.1' song={topSongs[14]} artist={artists[14]} clickHandler={handleClick}/>
            <PopCircle x = '64' y = '92' size = "9" label={`16.  ${artistNames[15]}`} delay='3.2' song={topSongs[15]} artist={artists[15]} clickHandler={handleClick}/>
            <PopCircle x = '92' y = '88' size = "12" label={`17.  ${artistNames[16]}`} delay='3.3' song={topSongs[16]} artist={artists[16]} clickHandler={handleClick}/>
            <PopCircle x = '80' y = '38' size = "11" label={`18.  ${artistNames[17]}`} delay='3.4' song={topSongs[17]} artist={artists[17]} clickHandler={handleClick}/>
            <PopCircle x = '88' y = '10' size = "12" label={`19.  ${artistNames[18]}`} delay='3.5' song={topSongs[18]} artist={artists[18]} clickHandler={handleClick}/>
            <PopCircle x = '91' y = '55' size = "10" label={`20.  ${artistNames[19]}`} delay='3.6' song={topSongs[19]} artist={artists[19]} clickHandler={handleClick}/>
        </div>
    );
}

function renderAnalysisContainer(tracksData){
    
    createRoot(document.querySelector('.analysis-container')).render(
        <div>

        </div>
    )
}

async function getAudioFeatures(tracksData, accessToken){
    try{
        const trackIds = [];
        tracksData.items.forEach(track => {
            trackIds.push(track.id);
        });
        const trackIdsString = trackIds.join(',');
        const apiUrl = `https://api.spotify.com/v1/audio-features?ids=${trackIdsString}`;
        return fetch(apiUrl, {
            method: 'GET', 
            headers: {
                Authorization: 'Bearer ' + accessToken, 
            }
        })
    }
    catch (error){
        console.error('Error retrieving audio features', error);
    }
}

async function playTrack(accessToken, track, deviceId){
    try{
        const duration = Math.floor((track.duration_ms)/3);
        return fetch('https://api.spotify.com/v1/me/player/play?device_id='+deviceId, {
            method: 'PUT', 
            headers: {
                Authorization: 'Bearer ' + accessToken, 
                'Content-Type': 'application/json', 
            }, 
            body: JSON.stringify({ 
                uris: [`${track.uri}`], 
                offset: {
                    position: 0
                },
                position_ms: `${duration}`
            })
        })
    }
    catch (error){
        console.error('Error playing the song: ', error);
    }

}

// eslint-disable-next-line
async function getArtistTopSong(accessToken, artist){
    try{
        const url = 'https://api.spotify.com/v1/artists/'+artist.id+'/top-tracks?country=US';
        const response = await fetch(url, {
            method: 'GET', 
            headers: {
                Authorization: 'Bearer ' + accessToken, 
            }, 
        })
        const data = await response.json();
        return data.tracks[0]; 
    }
    catch (error){
        console.error('Error playing the song: ', error);
    }
}


/****Things to add: 
 * Valence: happiness
 * BPM??
 * Tags? 
 * Genres? 
 * Danceability?
 * 
 * 
 */    