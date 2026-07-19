const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        maxlength: 280
    },
    image: {
        type: Array
    },
    likes: {
        type: Array,
        default: []
    },
    replies: {
        type: Array,
        default: []
    },
    retweets: {
        type: Array,
        default: []
    },
    reply: {
        type: Boolean,
        required: true
    },
    replyTo: {
        type: String
    }
}, {
    timestamps: true
});

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
