import './config.mjs';
import express from 'express'
import SpotifyWebApi from 'spotify-web-api-node';
import path from 'path'
import './db.mjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import flash from 'connect-flash';
import session from 'express-session'

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
const Related = mongoose.model('Related');

// setting up passport.js
passport.use(new LocalStrategy(User.authenticate()));
let curUser;

const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// use static serialize and deserialize of model for passport session support
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// setting up spotify api
const spotifyApi = new SpotifyWebApi({
    clientId: 'e5445e19f4ab47c49c125f3e81bd2fb3',
    clientSecret: '643dc358b4a64d66a8c6a98380ca07be'
});

// retrieve spotify access token
spotifyApi.clientCredentialsGrant().then(
    function (data) {
        const token = data.body['access_token'];
        spotifyApi.setAccessToken(token);
    },
    function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
);

app.get('/', async (req, res) => {
    await Artist.deleteMany({});
    const key = {};
    const titles = [];
    const noDupes = [];

    Playlist.find(key)
        .then(playlists => {
            playlists.map(item => {
                if (item.username === curUser) {
                    if (noDupes.includes(item.playlistName) === false) {
                        noDupes.push(item.playlistName);
                        const plName = item.playlistName;
                        const obj = { 'playlistName': plName, 'info': [item.artists] };
                        titles.push(obj);
                    }
                    else {
                        const target = titles.filter(x => x.playlistName === item.playlistName);
                        const obj = item.artists;
                        target[0].info.push(obj);
                    }
                }
            });
            res.render('home', { titles });
        })
        .catch(() => res.status(500).send("Server Error"));
});

app.get('/register', (req, res) => {
    // registration page
    res.render('register', {});
});

app.post('/register', function (req, res, next) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err) {
        if (err) {
            res.render('register', { message: 'User already exists, please try again.' });
        }
        else {
            res.render('register', { message: 'User registered! Please log in.' });
        }
    });
});

app.get('/login', function (req, res) {
    try {
        res.render('login', { user: req.user });
    }
    catch (e) {
        res.send('Incorrect password');
    }
});

app.post('/login', passport.authenticate('local', { session: false, failureRedirect: '/login', failureFlash: true }), function (req, res) {
    try {
        curUser = req.user.username;
        res.redirect('/');
    }
    catch (e) {
        res.render('login', { message: 'Incorrect login, please try again.' });
    }
});

app.get('/create', (req, res) => {
    // created playlists  here
    if (curUser !== undefined) {
        res.render('create', {});
    }
    else {
        res.send('Please register or login.');
    }
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
                username: curUser,
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
        .then(async function (found) {
            res.render('filter', { found });
            await Artist.deleteMany({});
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

app.get('/related', (req, res) => {
    // search related artists here
    const key = {};

    Related.find(key)
        .then(async function (found) {
            res.render('related', { found });
            await Related.deleteMany({});
        })
        .catch(() => res.status(500).send("Server Error"));
});

app.post('/related', async (req, res) => {
    await Related.deleteMany({});

    spotifyApi
        .searchArtists(req.body.artist)
        .then(data => {
            const link = data.body.artists.items[0]['external_urls'].spotify;
            const artistID = link.split('/')[4];
            const arr = [];

            spotifyApi.getArtistRelatedArtists(artistID)
                .then(data => {
                    const list = data.body.artists;
                    list.map(artist => {
                        const obj = new Related({
                            "name": req.body.artist,
                            "artistName": artist.name,
                            "genre": artist.genres[0],
                            "link": artist.external_urls.spotify
                        });
                        obj.save();
                    });

                    res.redirect('/related');
                });
        });
});

app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy();
        curUser = undefined;
        res.redirect('/');
    });
});

app.listen(process.env.PORT || 3000);

