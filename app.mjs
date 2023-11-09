import './config.mjs';
import express from 'express'
import path from 'path'
import './db.mjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set up express static
app.use(express.static(path.join(__dirname, 'public')));

// configure templating to hbs
app.set('view engine', 'hbs');

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

// database collections
const User = mongoose.model('User');
const Playlist = mongoose.model('Playlist');

app.get('/', async (req, res) => {
    const key = {};

    Playlist.find(key)
        .then(playlists => {
            res.render('home', { playlists });
        })
        .catch(() => res.status(500).send("Server Error"));
});

app.get('/register', (req, res) => {
    // registration page
});

app.post('/register', (req, res) => {
    // handle form data for registering and logging in
});

app.get('/spotify-profile-demo/index.html', (req, res) => {
    
}); 

app.get('/create', (req, res) => {
    // created playlists  here
    res.render('create', {});
});

app.post('/create', async (req, res) => {
    // handle form data for creating playlists
    const title = req.body.title;
    const artist = req.body.artist;
    const songs = [{ title, artist }];

    const p = new Playlist({
        playlistName: req.body.playlist,
        songs: songs
    });

    // saving review to database
    p.save()
        .then(() => res.redirect('/'))
        .catch(() => res.status(500).send("Server Error"));
});

app.get('/edit', (req, res) => {
    // edit playlists  here
});

app.post('/edit', (req, res) => {
    // handle form data for editing playlists
});

app.listen(process.env.PORT || 3000);
