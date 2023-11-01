import mongoose from 'mongoose';

mongoose.connect(process.env.DSN);

// define the data in our collection
const User = new mongoose.Schema({
    username: String,
    password: String,
    playlist: [Playlist]
});

const Playlist = new mongoose.Schema({
    username: String,
    name: String,
    songs: [{
        title: String,
        artist: String,
        genre: String
    }]
});

// "register" it so that mongoose knows about it
mongoose.model('User', User);
mongoose.model('Playlist', Playlist);