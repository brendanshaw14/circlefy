# Circlefy Web App
 
 This web app was created individually as a side project to practice web development. Although similar apps exist, I chose to make a 'Spotify Wrapped' knockoff to display a user's top tracks and artists of the month while supporting in app music playback. 

Due to Spotify's licensing, I am unable to host the app to the public, so this documentation will provide detailed explanations of how the app works and images displaying its interface. 

## Starting with React: 
I used React's _create-react-app_ framework to configure the application, which is ideal for singe-page web apps like this one. I also decided that learning how to work with react rendering and components would be useful. I also desided to use `.jsx` and `.scss` for my site in order to allow more efficient interactivity and nested styling. 

## Design Overview

In order to fetch user data from Spotify's API, you must register the app through the API and your Spotify account. This gives you a ClientID to use, and allows you to set the redirect URL for the API to bring the client to after authentication. After registering the app with my account, I began reading the API's documentation on the Authentication with PCKE, which is the most secure and effective authentication method. 

