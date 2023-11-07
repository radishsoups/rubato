import './config.mjs';
import express from 'express'
import path from 'path'
import './db.mjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configure templating to hbs
app.set('view engine', 'hbs');

const User = mongoose.model('User');
const Playlist = mongoose.model('Playlist');

app.get('/', (req, res) => {
    const test = {hello: 'hello world'};
    res.render("home", test);
});

app.get('/register', (req, res) => {
    // registration page
});

app.post('/register', (req, res) => {
    // handle form data for registering and logging in
});

app.get('/create', (req, res) => {
    // create playlists  here
});

app.post('/create', (req, res) => {
    // handle form data for creating playlists
});

app.get('/edit', (req, res) => {
    // edit playlists  here
});

app.post('/edit', (req, res) => {
    // handle form data for editing playlists
});

app.listen(process.env.PORT || 3000);
