import "./home.scss"
import Circle from "../../components/circle"
import React from 'react';
import { createRoot } from 'react-dom/client';


const clientId = 'a27fb42203c6414fa9076b4f545bc38a';
const redirectUri = 'http://localhost:3000/home/';
let accessToken;
let username;

const Home = () => {

    accessToken = localStorage.getItem('access_token');
    if (!accessToken){
        console.log("no access token, getting token");
        getAccessToken(accessToken);
    }
    else if (!verifyAccessToken(accessToken)){
        console.log("token expired: refreshing token")
        refreshAccessToken();
    }
    else{
        console.log("token exists and was validated")
    }

    function verifyAccessToken() {
        const expires_at = localStorage.getItem('expires_at');
        // Parse the expiration time from ISO 8601 format
        const expirationTimestamp = Date.parse(expires_at);
        // Get the current timestamp
        const currentTimestamp = Date.now();
        // Compare the current timestamp with the expiration timestamp
        return currentTimestamp <= expirationTimestamp;
    }

     // Function to be executed when local storage changes
    if (accessToken) {
        getProfile(accessToken)
        .then(data => {
            username = data.display_name;
            console.log(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
        }
    else{
            console.log('Error retrieving access token');
    } 

   
    fetch('https://api.spotify.com/v1/me/top/artists', {
    headers: {
        'Authorization': 'Bearer ' + accessToken
    }
    })
    .then(response => {
        if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        // Process the user's top artists data here
        console.log(data);
        // Process the user's top artists data here
        const topArtists = data.items.slice(0, 5); // Get top 5 artists
    
        const profilePhotoUrls = topArtists.map(artist => artist.images[0]?.url);
    
        // Now you have an array of profile photo URLs
        console.log(profilePhotoUrls);
        createRoot(document.querySelector('.circle-container')).render(
            <div>
            <Circle x="95" y="80" size="20" image={profilePhotoUrls[0]} />,
            <Circle x = '35' y = '45' size = '40' color="#ff9f3d" text={`Hello, ${username}`}/> 
            <Circle x = '90' y = '30' sisze = '10' color="#ff59b5"/> 
            <Circle x = '60' y = '18' size = "18" image={profilePhotoUrls[1]} style={{
                animation: 'fade-in 2s ease-in', 
              }}/>
            <Circle x = '8' y = '10' size = "20" image={profilePhotoUrls[2]} />
            <Circle x = '55' y = '80' size = "12" image={profilePhotoUrls[3]}/>
            <Circle x = '79' y = '55' size = '20' color="#ff59b5" text="Login with your account below"/> 
            <Circle x = '12' y = '75' size = '15' color="#399fec"  />
            <Circle x = '85' y = '10' size = '15' color="#a8df85" text="See top tracks, artists, and more" />
            <Circle x = '70' y = '95' size = '10' color="rgb(233, 215, 61)"/>);
            </div>, 
        );
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
    
    return (
        <div className="home">
            <header className="header-container"> 
                <h1 className="title">Circlefy</h1>
            </header>
            <main className="body-container"> 
                <div className="circle-container">
                    {/* Your circle content */}
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

async function getAccessToken(accessToken){
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

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        accessToken = data.accessToken;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('expires_in', data.expires_in);
        // Calculate the expiration time in milliseconds from the 'expires_in' value
        //const expiresInMilliseconds = localStorage.getItem('expires_in') * 1000;
        const expiresInMilliseconds = 10000;
        // Calculate the expiration timestamp and save it in local storage
        const expirationTimestamp = Date.now() + expiresInMilliseconds;
        localStorage.setItem('expires_at', new Date(expirationTimestamp).toISOString());
    })
    .catch(error => {
        console.error('Error:', error);
    });

}
async function refreshAccessToken() {
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
        console.log("Data.expires in upon callin refresh access token: "+ data.expires_in);
      })
      .catch((error) => {
        console.error('Error refreshing access token:', error);
      });
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


