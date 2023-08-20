import "./home.scss"
//import Circle from "../../components/circle"
import PopCircle from "../../components/popcircle"
import React from 'react';
import { createRoot } from 'react-dom/client';


const clientId = 'a27fb42203c6414fa9076b4f545bc38a';
const redirectUri = 'http://localhost:3000/home/';

let username; 

const Home = () => {
    
    //call the init function to check and update the access token, then use the promise to fetch and store data  
    init()
    .then((accessToken) => {

        if (accessToken) {
            getProfile(accessToken)
            .then(data => {
                username = data.display_name;
                console.log(data);
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
            });
        }
        else{
                console.log('Error retrieving access token for profile data fetch');
        } 
        if (accessToken) {
            getArtists(accessToken)
            .then(data => {
                console.log(data);
                //save the artist data
                const topArtists = data.items; 
                const profilePhotoUrls = topArtists.map(artist => artist.images[1]?.url); //save top artist images in array
                //render the circles with the artist names
                createRoot(document.querySelector('.intro-container')).render(
                    <div>
                    <PopCircle x = '40' y = '45' size = '40' color="#a8df85" text={`Hello, ${username}`}/> 
                    <PopCircle x = '10' y = '10' size = "18" image={profilePhotoUrls[7]} delay='0.2'/>
                    <PopCircle x = '30' y = '95' size = "6" image={profilePhotoUrls[2]} delay='0.2'/>
                    <PopCircle x = '18' y = '35' size = "8" image={profilePhotoUrls[5]} delay='0.2'/>
                    <PopCircle x = '15' y = '80' size = "25" image={profilePhotoUrls[3]} delay='0.4'/>
                    <PopCircle x = '60' y = '85' size = "12" image={profilePhotoUrls[14]} delay='0.6'/>
                    <PopCircle x = '90' y = '92' size = "15" image={profilePhotoUrls[10]} delay='0.6'/>
                    <PopCircle x = '64' y = '15' size = "8" image={profilePhotoUrls[8]} delay='0.6'/>
                    <PopCircle x = '90' y = '15' size = "15" image={profilePhotoUrls[1]} delay='0.8'/>
                    <PopCircle x = '75' y = '55' size = "27" image={profilePhotoUrls[0]} delay='0.8'/>
                    </div>, 
                );
            })
            .catch(error => {
                console.error('Error fetching artist data:', error);
            });
        }
        else{
                console.log('Error retrieving access token for profile data fetch');
        } 
    }) 
    .catch((error) => {
        console.error("Error during initialization:", error);
    });

    return (
        <div className="home">
            <header className="header-container"> 
                <h1 className="title">Circlefy</h1>
            </header>
            <main className="body-container"> 
                <div className="intro-container">
                </div>
            </main>
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
            console.log("no access token, getting token");
            accessToken = await getAccessToken();
        }
        else if (!verifyAccessToken(accessToken)){
            console.log("token expired: refreshing token")
            accessToken = await refreshAccessToken();
        }
        else{
            console.log("token exists and was validated")
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
    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
    headers: {
        Authorization: 'Bearer ' + accessToken
    }
    });
    const data = await response.json();
    return data; // Return the user's data from the Spotify API
}


