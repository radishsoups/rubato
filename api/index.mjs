import './config.mjs';
import express from 'express'
import SpotifyWebApi from 'spotify-web-api-node';
import path from 'path'
import './db.mjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// setting up express
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// configure templating to hbs
app.set('view engine', 'hbs');

// database collections
const User = mongoose.model('User');
const Playlist = mongoose.model('Playlist');
const Artist = mongoose.model('Artist');

// setting up spotify api
// https://www.npmjs.com/package/spotify-web-api-node#fetch-music-metadata
const spotifyApi = new SpotifyWebApi({
    clientId: 'e5445e19f4ab47c49c125f3e81bd2fb3',
    clientSecret: '643dc358b4a64d66a8c6a98380ca07be'
});

// retrieve spotify access token
spotifyApi.clientCredentialsGrant().then(
    function (data) {
        // console.log('The access token expires in ' + data.body['expires_in']);
        // console.log('The access token is ' + data.body['access_token']);
        const token = data.body['access_token'];
        spotifyApi.setAccessToken(token);
    },
    function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
);

app.get('/', async (req, res) => {
    // for vercel
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    await Artist.deleteMany({});

    const key = {};
    const titles = [];
    const noDupes = [];

    Playlist.find(key)
        .then(playlists => {
            playlists.map(item => {
                if (noDupes.includes(item.playlistName) === false) {
                    noDupes.push(item.playlistName)
                    const plName = item.playlistName;
                    const obj = { 'playlistName': plName, 'info': [item.artists] };
                    titles.push(obj)
                }
                else {
                    const target = titles.filter(x => x.playlistName === item.playlistName);
                    const obj = item.artists;
                    target[0].info.push(obj)
                }
            });

            // titles.map(x => console.log(x))
            res.render('home', { titles });
        })
        .catch(() => res.status(500).send("Server Error"));
});

app.get('/register', (req, res) => {
    // registration page
});

app.post('/register', (req, res) => {
    // handle form data for registering and logging in
});

app.get('/create', (req, res) => {
    // created playlists  here
    res.render('create', {});
});

app.post('/create', async (req, res) => {
    // handle form data for creating playlists
    const artist = req.body.artist;
    let link;

    // search spotify by artist name and get artist link
    spotifyApi
        .searchArtists(artist)
        .then(data => {
            link = data.body.artists.items[0]['external_urls'].spotify;

            const p = new Playlist({
                playlistName: req.body.playlist,
                artists: { artist: req.body.artist, link: link }
            });

            // saving playlist to database
            p.save()
                .then(() => {
                    res.redirect('/');
                })
                .catch(() => res.status(500).send("Server Error"));
        })
        .catch(err => {
            console.log("The error while searching artists occurred: ", err);
        });
});

app.get('/filter', async (req, res) => {
    // filter albums  here
    const key = {};

    Artist.find(key)
        .then(found => {
            res.render('filter', { found });
        })
        .catch(() => res.status(500).send("Server Error"));
});

app.post('/filter', async (req, res) => {
    await Artist.deleteMany({});

    spotifyApi
        .searchArtists(req.body.artist)
        .then(data => {
            const albumList = [];
            const link = data.body.artists.items[0]['external_urls'].spotify;
            const artistID = link.split('/')[4];

            spotifyApi.getArtistAlbums(artistID).then(data => {
                data.body.items.map(x => {
                    albumList.push(x.name)
                });

                let query = { artistName: req.body.artist };
                let update = {
                    $setOnInsert: {
                        artistName: req.body.artist, albums: albumList
                    }
                };
                let options = { upsert: true };

                Artist.findOneAndUpdate(query, update, options)
                    .catch(error => console.error(error));

                res.redirect('/filter');
            });
        });
});

app.listen(process.env.PORT || 3000);

module.exports = app;

