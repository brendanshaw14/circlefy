import "./home.scss"

const clientId = 'a27fb42203c6414fa9076b4f545bc38a';
const redirectUri = 'http://localhost:3000/home/';


const Home = () => {


    let accessToken = localStorage.getItem('access_token');
    if (!accessToken){
        getAccessToken(accessToken);
    }
    else if (!verifyAccessToken(accessToken)){
        console.log("token expired")
        refreshAccessToken();
    }
    else{
        console.log("token validated")
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
            console.log(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
        }
    else{
            console.log('Error retrieving access token');
    } 
  
  

   
    fetch('https://api.spotify.com/v1/me/top/tracks', {
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
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
    
    return (
        <div className="home">
            <h1 className = "title">Home</h1>
        </div>
    )
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
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('expires_in', data.expires_in);
        accessToken = localStorage.getItem(data.accessToken);
        // Calculate the expiration time in milliseconds from the 'expires_in' value
        const expiresInMilliseconds = localStorage.getItem('expires_in') * 1000;
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


