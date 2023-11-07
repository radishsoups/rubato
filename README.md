# Rubato

## Overview

Spotify's Blend playlists let you share your favorite songs with your friends based on your and their music preferences. However, users cannot manually add or remove songs in these playlists, which defeats the purpose of a collaborative playlist and restricts the contents of the playlist to what Spotify wants to add.

Rubato is a web app that will allow users to create playlists and share music with others. Users can register and login, and once they're logged in, they can view the playlists they have shared. In each playlist, they can add or delete songs.


## Data Model

The application will store users, playlists, and songs. 

* users can have multiple playlists (via references)
* each list can have multiple songs (by embedding)

An example user:

```javascript
{
  username: "radishsoups",
  hash: // a password hash,
  playlists: // an array of references to playlist documents
}
```

An example playlist with Embedded songs:

```javascript
{
  user: // a reference to a User object
  name: // title of playlist
  items: [
    { name: "song1", genre: "lofi", artist: "artist1"},
    { name: "song2", genre: "classical", artist: "artist2"},
  ],
}
```

## [Link to Commented First Draft Schema](db.mjs) 
[Draft Schema](db.mjs)

## Wireframes

/home - landing page that displays all playlists

![home](documentation/home.png)

/create - page for creating a new playlist

![create](documentation/create.png)

/register - page for registration or login

![register](documentation/register.png)

/edit - page for editing playlists (adding / deleting songs)

![search](documentation/edit.png)

## Site map

![search](documentation/map.png)

## User Stories or Use Cases

1. as a non-registered user, I can register on the site
2. as a user, I can log in to the site
3. as a user, I can create and share a new playlist
4. as a user, I can view all of the playlists I have created 
5. as a user, I can add songs to an existing playlist
6. as a user, I can remove songs from a playlist

## Research Topics

* (5 points) Spotify Web API
    * I'm going to be using Spotify's API to search for songs and artists
    * This will also keep track of genres and potentially be able to search user playlists on Spotify
* (3 points) User Authentication
    * I'm going to use Passport.js for user authentication and login 
* (2 points) Hosting on Vercel
    * Connect GitHub account to Vercel in order to host the site (rather than uploading onto NYU's i6 server)

10 points total out of 10 required points


## [Link to Initial Main Project File](app.mjs) 

[Main project file](app.mjs)

## Annotations / References Used

1. [spotify api docs](https://developer.spotify.com/documentation/web-api)
2. [passport.js authentication docs](http://passportjs.org/docs)
3. [vercel hosting docs](https://vercel.com/docs)

