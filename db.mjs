import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

mongoose.connect(process.env.DSN);

// define the data in our collection
const Playlist = new mongoose.Schema({
    username: String,
    playlistName: String,
    artists: { artist: String, link: String },
});

const User = new mongoose.Schema({
    username: String,
    password: String,
});

const Artist = new mongoose.Schema({
    artistName: String,
    albums: [String]
});

User.plugin(passportLocalMongoose);

// "register" it so that mongoose knows about it
mongoose.model('User', User);
mongoose.model('Artist', Artist);
mongoose.model('Playlist', Playlist);