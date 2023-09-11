# Circlefy Web App
 
 This web app was created individually as a side project to practice web development. Although similar apps exist, I chose to make a 'Spotify Wrapped' knockoff to display a user's top tracks and artists of the month while supporting in app music playback. 

Due to Spotify's licensing, I am unable to host the app to the public, so this documentation will provide detailed explanations of how the app works and images displaying its interface. 

## Starting with React: 
I used React's _create-react-app_ framework to configure the application, which is ideal for singe-page web apps like this one. I also decided that learning how to work with react rendering and components would be useful. I also desided to use `.jsx` and `.scss` for my site in order to allow more efficient interactivity and nested styling. 

## Design Overview

### OAuth and PCKE Flow
In order to fetch user data from Spotify's API, your app must be registered through the API and your Spotify account. This gives you a ClientID to use, and allows you to set the redirect URL for the API to bring the client to after authentication. After registering the app with my account, I began reading the API's documentation on the Authentication with PCKE, which is the most secure and effective authentication method.

The PKCE authentication flow runs as follows: 

- User presses the login button
- Application generates a code and redirects the user to the Spotify account login page
- User grants permission through their Spotify account page
- User is redirected to the redirect URL provided to the Spotify API
- Application parses the URL to retrieve a code from the API
- Application uses that code to request an access token that can be used to fetch data from the API. 

In order to implement this, I based the site around two main pages: a login page and a home page. The login page is fairly straightforward: the user loads the page and clicks the login button, which automatically generates the authorization request and the code challenge, which redirects the user to the Spotify login page. I used the methods provided by the Spotify for this: specificaly generating the random string, encoding it, and hashing it before sending it to the API.

### Redirecting and Fetching Data
Afterwards, the user is redirected back to the home page by the API. This is where the URL is parsed to retrive the code sent by the API that is used to retrieve the access token. The access token is then saved and used to make data fetch requests to the API. 

This part quickly became difficult, becuase I had to figure out how to wait before rendering certain components of the page until the appropriate data requests were made and the data was handled accordingly. This required a lot of asynchronous operations. 

To handle this, I first revalidate the accessToken upon each render of the page. This means checking if there is an access token already stored in the local storage and, if it exists, ensuring it is not expired. I wrote an `init` method to evaluate these conditions, and then call the `getAccessToken` and `refreshAccessToken` methods accordingly. 
```
async function init(){
        let accessToken = localStorage.getItem('access_token');
        if (!accessToken){
            accessToken = await getAccessToken();
        }
        else if (!verifyAccessToken(accessToken)){
            accessToken = await refreshAccessToken();
        }
        else{
        }
        return accessToken
}
```
The first challenge was handling the local storage and converting the timestamps in order to determine whether or not the token was expired. This meant, upon each token fetch or refresh, I had to use the `expires_in` parameter to determine what time the access token would expire and store it in local storage to be evaluated later. I implemented this within the `getAccessToken` and `refreshAccessToken` methods, and used the following method to evaluate token expiration. 
```
function verifyAccessToken() {        
    const expires_at = localStorage.getItem('expires_at');
    // Parse the expiration time from ISO 8601 format
    const expirationTimestamp = Date.parse(expires_at);
    // Get the current timestamp
    const currentTimestamp = Date.now();
    // Compare the current timestamp with the expiration timestamp
    return currentTimestamp <= expirationTimestamp;
} 
```
More importantly though, I had to figure out how to prevent the components of the page that depended on the API data from attempting a render before their data had even been fetched. 

I used the `useEffect` and `useState` hooks for this, which allowed me to implement the following flow: 

- Upon initial load, the page checks for the access token, retrieving a new one if it doesn't exist or if the existing token is expired. 
- If the token doesn't already exist, a new token is retrieved before setting the `accessToken` state and triggering a re-render. 

```
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
```
- When a re-render occurs and the accessToken exists, the user's data will be fetched from the API using the token. 
```
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
```

## Frontend and Data Display

After fetching the data, I needed to find a way to display it on the home page. The data that the API provides access to is somewhat limited, so decided to focus more on having an active user experience rather than just displaying as much data as possible. I decided to center the design around circular bubbles that would display the information, so I began by making the react components found in the `/components/circles` folder. I configured them to take in different props that would determine their position within their containers, their size, and any content displayed within them. I named these two components `fadecircle` and `popcircle` since each support different animation styles. 

On the login page, I just used the circles to look cool-- I chose a color scheme and then chose some recognizeable album art to display. 
![image](/screenshots/login-title.png)
At the bottom sits the login button that connects the user to the API, along with the footer included in both the login and home page. 
![image](/screenshots/login-button.png)

On the home page, I used a similar aesthetic, but instead used the circle components to display the information itself. However, I didn't want the page to just be a stagnant display, so I added fade-in and pop in animations for the circle components, as well as a hover style. Then, I added a scroll event listener to the page to determine how far the user had scrolled and then render the corresponding container accordingly. I also added a `delay` prop to each circle component, allowing me to decide the order in which the bubbles would fade or pop into existence. This was the first container of the home page: 

![image](/screenshots/home-intro.png)

The page appears similarly to the login page, but instead of pre-determined art, it displays the artist profile photos of some of the user's top artists, as well as their username. 

As you scroll down the page, more elements appear in their containers as you reach them, for example holding the user's top tracks or top artists of the month. I did this by creating an array of functions that would use the React `createRoot` method to render the components in their respective containers. As the user scrolls down the page, the total scroll distance is used to calculate which container is on screen, and its corresponding rendering function is called. Each function ultimately takes data repsonses from the API as input and then uses React's `createRoot` method to render the components storing the data into their containers accordingly. Here are a few of the containers on display: 

![image](/screenshots/home-tracks1.png)
![image](/screenshots/home-tracks2.png)
![image](/screenshots/home-artists.png)
![image](/screenshots/home-artists2.png)

When I designed the page, I was unaware that Spotify strictly prohibits any form of cropping applied to their metadata (in my case, album art or artist profile pictures). This is why I couldn't extend the developer quota to make host the page publicly-- Spotify only allows 25 pre-specified users to login to your app in developer mode. Anyway, I liked the idea of displaying the data as bubbles with the pictures of the artist profile or album art stored inside, so I created the `circle` components. 

These components took a fair amount of time to create, mainly because I wanted to make them adaptable to different types of content. Each component is able to store either text on a color background or an image, as well as a text label below. Its position is calculated relative to the container, and I hardcoded most of them to my liking. I created two separate circles- a `FadeCircle` and a `PopCircle`- because I was tired of adding more props and wanted to be able to apply just one CSS style. As the names suggest, the pop into view like a bubble and the fade circles fade into existance. I use both throughout the app to create different visual effects. When I adapted the site to implement the playback SDK, I updated the circle components further- which I discuss below. 

I also took some time to make the device mobile friendly. Since the circle positions were hardcoded within the container, some issues occured when significant changes to the aspect ratio of the screen occurred without corresponding size and spacing changes to the circles. Accordlingly, I just used a CSS width threshold to determine which components to render, and rewrote the original components but in different locations to customize the mobile display. 
## Playback 

After implementing the authentication, data fetching, and component rendering, I decided to add audio playback features to the site similar to Spotify's yearly wrapped. There is a Spotify web playback SDK through the Spotify developer's page, but unfortunately it needs to be loaded as a script in the page, so I had to make a separate react component for it. This is the `WebPlayback` component-- which I coded to load the script individually and initialize the player. Loading the player and activating it was pretty complicated, mainly because I had to embedd it into the asynchronous logic once again. The script needs to be loaded, the player needs to be initialized, and then event listeners need to be configured to handle any updates and errors. This created a lot of issues- and I may have done this somewhat inefficiently- but the best method I could figure out was to pass functions to the WebPlayback component that would use the `useState` hook in my main app to trigger re-renders when necessary. 

The first challenge I had to deal with was initiating the player-- because most browsers don't allow for automatic playback from sites, I had to have the users initiate playback interactively. To do this, I decided to code a separate component for the webplayer that the user can toggle to initiate playback. I had to then render the component conditionally based on whether or not the player was activated, displaying a message urging users to click the button if not and displaying information about the song if so. This took a bit of work again due to the asynchronous nature of the coding, but I figured it out-- see both `home.jsx` and `webplayback.js` to see how. 

This is what the player looks like upon load:
![image](/screenshots/player-inactive.png)

Upon clicking the button, the player automatically loads a song from the user's top 10 tracks of the month, and then begins playing a new song (from the user's top 5) as the user scrolls through each comoponent. The player also jumps automatically to a point about 1/3 of the way through the song (I determined this is pretty reliably a good place to kick it off- after the verse but before any bridge). This was all done using the fetch calls to the API, which I am not going to bother explaining in this documentation. 
![image](/screenshots/player-active.png)

Although, once again, this visual doesn't fly because Spotify hates circles, I enjoyed designing the player. It has its own container and display, with a functional play/pause button, and displays both the song name and artist without overfilling the container. I also created a separate circle component (which is very similar to the others) to contain the album art for the song in the player. You can't see it on the picture, but the artwork spins when the song is playing, kind of like a vinyl on a record player. 

More complications arose when I decided it would be a cool idea to make the data displaying circles themselves interactive, specifically by allowing the user to play a given artist or song by just clicking on the circle svg with that artist or song. This meant more modifications to my `circle` components, and a lot of issues arose because I had to find ways to use the `fadecircle` and `popcircle` components to trigger API fetch calls in the `home` component and then trigger the player updates accordingly. 

Again, see `webplayback.js`, `home.jsx`, and all of the `circle` components for details on this which I won't go into. I did get this all to work though, so a user can trigger any song to play just by clicking on the circle containing that song, and can trigger any artist's most popular song to play by clicking the circle containing that artist. 

## Conclusion and Future Plans

Overall, this project was a great way to get into web development. I had little to no experience beforehand don't think I knew the exact difficulty of what I was getting into, but nonetheless really enjoyed the process. It took hours upon hours of research to make each component work (not to mention debugging), but seeing everything work in the end was worth it. 

I had planned to add a lot more components with different data analysis features after the main tracks and artists listings, but after I found out that the entire structure of my site was not going to be allowed on public display by Spotify, I deemed it a waste of time since I had already learned how to write all the components. Regardless, the project was quite entertaining and useful as a learning tool. 