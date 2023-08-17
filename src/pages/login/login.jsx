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
                <Circle x = '35' y = '45' size = '40' color="#ff9f3d" text="Your Spotify Wrapped, All Year Round " />
                <Circle x = '90' y = '30' sisze = '10' color="#ff59b5"/> 
                <Circle x = '95' y = '80' size = "20" image="images/KaliUchis-Isolation.png" />
                <Circle x = '60' y = '15' size = "15" image="images/DuaLipa-FutureNostalgia.png" />
                <Circle x = '8' y = '10' size = "20" image="images/Khalid-AmericanTeen.jpg" scale = "1.045"/>
                <Circle x = '55' y = '80' size = "12" image="images/TravisScott-Astroworld.png"/>
                <Circle x = '79' y = '55' size = '20' color="#ff59b5" text="Login with your account below"/> 
                <Circle x = '12' y = '75' size = '15' color="#399fec" text="" />
                <Circle x = '85' y = '10' size = '15' color="#a8df85" text="See top tracks, artists, and more 4" />
                <Circle x = '70' y = '95' size = '10' color="rgb(233, 215, 61)"/>
            </div>
            <div className="button-container">
                <button className="login-button" onClick={handleLogin}>Login with Spotify</button>
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
};

export default Login;
