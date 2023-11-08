import mongoose from 'mongoose';

console.log(process.env.DSN);
mongoose.connect(process.env.DSN);

// define the data in our collection
const Playlist = new mongoose.Schema({
    username: String,
    playlistName: String,
    songs: [{
        title: String,
        artist: String,
    }]
});

const User = new mongoose.Schema({
    username: String,
    password: String,
    playlist: [Playlist]
});

// "register" it so that mongoose knows about it
mongoose.model('User', User);
mongoose.model('Playlist', Playlist);