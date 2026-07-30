const Tweet = require('../models/Tweet');
const User = require('../models/User');

// New tweet
exports.newTweet = async (req, res) => {
    try {
        const newTweet = new Tweet(req.body);
        const savedTweet = await newTweet.save();
        const updatedUser = await User.findByIdAndUpdate(req.body.userId, {
            $push: { tweets: savedTweet._id.valueOf() }
        }, { new: true });
        res.status(200).json({
            tweet: savedTweet,
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Edit tweet
exports.editTweet = async (req, res) => {
    try {
        const updatedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });
        res.status(200).json(updatedTweet);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete tweet
exports.deleteTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json('Tweet not found');
        }

        const user = await User.findByIdAndUpdate(req.body.userId, {
            $pull: { tweets: req.params.id }
        }, { new: true });

        const updatePromises = [];

        // Removing replies, likes and retweets from other users that interacted with tweet
        if (tweet.replies.length > 0) {
            tweet.replies.forEach(replyId => {
                updatePromises.push((async () => {
                    const reply = await Tweet.findById(replyId);
                    if (reply) {
                        await User.findByIdAndUpdate(reply.userId, {
                            $pull: { tweets: replyId }
                        });
                        await Tweet.findByIdAndDelete(replyId);
                    }
                })());
            });
        }

        if (tweet.likes.length > 0) {
            tweet.likes.forEach(userId => {
                updatePromises.push(User.findByIdAndUpdate(userId, {
                    $pull: { likes: req.params.id }
                }));
            });
        }
        if (tweet.retweets.length > 0) {
            tweet.retweets.forEach(userId => {
                updatePromises.push(User.findByIdAndUpdate(userId, {
                    $pull: { retweets: req.params.id }
                }));
            });
        }

        await Promise.all(updatePromises);
        await Tweet.findByIdAndDelete(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get tweet
exports.getTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        res.status(200).json(tweet);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get timeline tweets
exports.getTimeline = async (req, res) => {
    try {
        const tweets = await Tweet.find({
            reply: false
        });
        res.status(200).json(tweets);
    } catch (err) {
        console.error("Tweets timeline error:", err);
        res.status(500).json({ message: err.message || err });
    }
};

// Like tweet
exports.likeTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndUpdate(req.params.id, {
            $push: { likes: req.body.userId }
        }, { new: true });
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $push: { likes: req.params.id }
        }, { new: true });

        res.status(200).json({
            tweet: tweet,
            user: user
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Unlike tweet
exports.unlikeTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndUpdate(req.params.id, {
            $pull: { likes: req.body.userId }
        }, { new: true });
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $pull: { likes: req.params.id }
        }, { new: true });

        res.status(200).json({
            tweet: tweet,
            user: user
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Reply to tweet
exports.replyToTweet = async (req, res) => {
    try {
        const reply = new Tweet(req.body);
        const savedReply = await reply.save();
        const tweet = await Tweet.findByIdAndUpdate(req.params.id, {
            $push: { replies: savedReply._id.valueOf() }
        }, { new: true });
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $push: { tweets: savedReply._id.valueOf() }
        }, { new: true });
        res.status(200).json({
            tweet: tweet,
            reply: savedReply,
            user: user
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete reply
exports.deleteReply = async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndUpdate(req.params.tweetId, {
            $pull: { replies: req.params.replyId }
        }, { new: true });
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $pull: { tweets: req.params.replyId }
        }, { new: true });
        await Tweet.findByIdAndDelete(req.params.replyId);
        res.status(200).json({
            tweet: tweet,
            user: user
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Retweet
exports.retweet = async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndUpdate(req.params.id, {
            $push: { retweets: req.body.userId }
        }, { new: true });
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $push: { retweets: req.params.id }
        }, { new: true });
        res.status(200).json({
            tweet: tweet,
            user: user
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Remove retweet
exports.removeRetweet = async (req, res) => {
    try {
        const tweet = await Tweet.findByIdAndUpdate(req.params.id, {
            $pull: { retweets: req.body.userId }
        }, { new: true });
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $pull: { retweets: req.params.id }
        }, { new: true });
        res.status(200).json({
            tweet: tweet,
            user: user
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Bookmark tweet
exports.bookmarkTweet = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $push: { bookmarks: req.params.id }
        }, { new: true });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Remove bookmark
exports.removeBookmark = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.userId, {
            $pull: { bookmarks: req.params.id }
        }, { new: true });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get users that have liked tweet
exports.getTweetLikes = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json('Tweet not found');
        }
        if (tweet.likes.length === 0) {
            return res.status(200).json([]);
        }
        const users = await Promise.all(
            tweet.likes.map(userId => User.findById(userId))
        );
        res.status(200).json(users.filter(u => u !== null));
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get users that have retweeted tweet
exports.getTweetRetweets = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json('Tweet not found');
        }
        if (tweet.retweets.length === 0) {
            return res.status(200).json([]);
        }
        const users = await Promise.all(
            tweet.retweets.map(userId => User.findById(userId))
        );
        res.status(200).json(users.filter(u => u !== null));
    } catch (err) {
        res.status(500).json(err);
    }
};
