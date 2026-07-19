const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 10
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 25
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 25
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 100,
        default: ''
    },
    profilePicture: {
        type: String,
        default: 'default-profile-pic.png'
    },
    coverPicture: {
        type: String,
        default: ''
    },
    following: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    },
    tweets: {
        type: Array,
        default: []
    },
    likes: {
        type: Array,
        default: []
    },
    retweets: {
        type: Array,
        default: []
    },
    bookmarks: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
