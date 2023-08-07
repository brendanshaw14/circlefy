import "./login.scss"
import Circle from "../../components/circle"

// Global variables to store Spotify API details
const clientId = 'a27fb42203c6414fa9076b4f545bc38a';
const redirectUri = 'http://localhost:3000/home/';
const scope = ['user-top-read', 'user-library-read','user-follow-read']; // Add more scopes as needed

const Login = () => {
    
    /****************Authentication Functions Here****************/
    const handleLogin = () =>{ 
        //initiates spotify authentification 
        let codeVerifier = generateRandomString(128);
        generateCodeChallenge(codeVerifier).then(codeChallenge => {
            let state = generateRandomString(16);
            localStorage.setItem('code_verifier', codeVerifier);
            let args = new URLSearchParams({
                response_type: 'code',
                client_id: clientId,
                scope: scope,
                redirect_uri: redirectUri,
                state: state,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge
            });
            window.location = 'https://accounts.spotify.com/authorize?' + args;
        });
    
        //generates the rnadom string-- used for the code
        function generateRandomString(length) {
            let text = '';
            let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }

        //called above-- generates the code and converts to base64
        async function generateCodeChallenge(codeVerifier) {
            function base64encode(string) {
                return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            }
            const encoder = new TextEncoder();
            const data = encoder.encode(codeVerifier);
            const digest = await window.crypto.subtle.digest('SHA-256', data);
  
            return base64encode(digest);
        }
    }

    return (
    <div className="login">
        <header className="header-container"> 
            <h1 className="title">Circlefy</h1>
        </header>
        <main className="body-container"> 
            <div className="circle-container">
                <Circle color="#ff59b5" x = '50' y = '100' size = "20" image="images/KaliUchis-Isolation.png" />
                {/*<Circle color="#ff59b5" x = '50' y = '20' size = "10" image="images/DuaLipa-FutureNostalgia.png" />
                <Circle color="#ff59b5" x = '70' y = '20' size = "10" image="images/Khalid-AmericanTeen.jpg" scale = "1.045"/>
                <Circle color="#ff59b5" x = '70' y = '20' size = "10" image="images/TravisScott-Astroworld.png"/>
                <Circle color="#ff59b5" size = "10" /> 
                <Circle color="#ff9f3d" size = "50" text="Your Spotify Wrapped, All Year Round " />
                <Circle color="#a8df85" size = "10" text="Circle 3" />
    <Circle color="#399fec" size = "10" text="Circle 3" />*/}
            </div>
            <div className="button-container">
                <button className="login-button" onClick={handleLogin}>Login with Spotify</button>
            </div>
        </main>
        <footer>
        </footer> 
      
    </div>
  );
};

export default Login;
