const User = require('../models/User');
const Tweet = require('../models/Tweet');
const bcrypt = require('bcryptjs');

// Get user
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('User not found');
        }
        // Hide details that another user doesn't need to see
        const { email, password, bookmarks, isAdmin, updatedAt, ...otherDetails } = user._doc;
        res.status(200).json(otherDetails);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get active user
exports.getActiveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get user by username
exports.getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json('User not found');
        }
        const { email, password, isAdmin, updatedAt, ...otherDetails } = user._doc;
        res.status(200).json(otherDetails);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update user
exports.updateUser = async (req, res) => {
    // Re-encrypt password
    if (req.body.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('User not found');
        }

        const updatePromises = [];

        // Remove everything user has interacted with including other users and tweets
        if (user.following.length > 0) {
            const userFollowingList = user.following;
            userFollowingList.forEach(userId => {
                updatePromises.push(User.findByIdAndUpdate(userId, {
                    $pull: { followers: req.params.id }
                }));
            });
        }

        if (user.followers.length > 0) {
            const userFollowers = user.followers;
            userFollowers.forEach(userId => {
                updatePromises.push(User.findByIdAndUpdate(userId, {
                    $pull: { following: req.params.id }
                }));
            });
        }

        if (user.likes.length > 0) {
            const likes = user.likes;
            likes.forEach(tweetId => {
                updatePromises.push(Tweet.findByIdAndUpdate(tweetId, {
                    $pull: { likes: req.params.id }
                }));
            });
        }

        if (user.retweets.length > 0) {
            const retweets = user.retweets;
            retweets.forEach(tweetId => {
                updatePromises.push(Tweet.findByIdAndUpdate(tweetId, {
                    $pull: { retweets: req.params.id }
                }));
            });
        }
        
        await Promise.all(updatePromises);
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json('Account has been deleted');
    } catch (err) {
        res.status(500).json(err);
    }
};

// Follow user
exports.followUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $push: { followers: req.body.userId }
        }, { new: true });
        const currentUser = await User.findByIdAndUpdate(req.body.userId, {
            $push: { following: req.params.id }
        }, { new: true });

        res.status(200).json({
            user: user,
            currentUser: currentUser
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $pull: { followers: req.body.userId }
        }, { new: true });
        const currentUser = await User.findByIdAndUpdate(req.body.userId, {
            $pull: { following: req.params.id }
        }, { new: true });

        res.status(200).json({
            user: user,
            currentUser: currentUser
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get user tweets
exports.getUserTweets = async (req, res) => {
    try {
        const userTweets = await Tweet.find({
            userId: req.params.id
        });
        res.status(200).json([...userTweets]);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get liked tweets
exports.getUserLikes = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.likes.length === 0) {
            res.status(404).json('User has not liked any tweets');
        } else {
            const userLikes = await Promise.all(
                user.likes.map(tweet => Tweet.findById(tweet))
            );
            res.status(200).json([...userLikes]);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get retweets
exports.getUserRetweets = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.retweets.length === 0) {
            res.status(404).json('User has not retweeted any tweets');
        } else {
            const userRetweets = await Promise.all(
                user.retweets.map(tweet => Tweet.findById(tweet))
            );
            res.status(200).json([...userRetweets]);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get bookmarks (personal data)
exports.getUserBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.bookmarks.length === 0) {
            res.status(404).json('User has not bookmarked any tweets');
        } else {
            const userBookmarks = await Promise.all(
                user.bookmarks.map(tweet => Tweet.findById(tweet))
            );
            res.status(200).json([...userBookmarks]);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Clear bookmarks
exports.clearBookmarks = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: { bookmarks: [] }
        }, { new: true });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get user followers
exports.getUserFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('User not found');
        }
        if (user.followers.length === 0) {
            return res.status(200).json([]);
        }
        const followers = await Promise.all(
            user.followers.map(async (userId) => {
                const follower = await User.findById(userId);
                if (!follower) return null;
                const { email, password, bookmarks, isAdmin, updatedAt, ...otherDetails } = follower._doc;
                return otherDetails;
            })
        );
        res.status(200).json(followers.filter(f => f !== null));
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get user following
exports.getUserFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('User not found');
        }
        if (user.following.length === 0) {
            return res.status(200).json([]);
        }
        const following = await Promise.all(
            user.following.map(async (userId) => {
                const followedUser = await User.findById(userId);
                if (!followedUser) return null;
                const { email, password, bookmarks, isAdmin, updatedAt, ...otherDetails } = followedUser._doc;
                return otherDetails;
            })
        );
        res.status(200).json(following.filter(f => f !== null));
    } catch (err) {
        res.status(500).json(err);
    }
};

// Validate password
exports.validatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(406).json("Incorrect password");
        } else {
            // Send back user object
            res.status(200).json("Valid password");
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Check if username is available
exports.checkUsernameAvailability = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        !user ? res.status(200).json('Username is available') : res.status(406).json('Username is taken');
    } catch (err) {
        res.status(500).json(err);
    }
};

// Check if email is already in use
exports.checkEmailAvailability = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user ? res.status(200).json('Email is available') : res.status(406).json('Email is in use');
    } catch (err) {
        res.status(500).json(err);
    }
};
