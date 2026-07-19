/**
 * @file tweetRoute.js
 * @description Express routes for Tweet actions (CRUD, likes, retweets, replies, bookmarks).
 * Maps endpoints to tweetController logic.
 */

const express = require('express');
const tweetController = require('../controllers/tweetController');

const router = express.Router();

// Create new tweet: POST /api/tweets/new
router.post('/new', tweetController.newTweet);

// Edit an existing tweet: PUT /api/tweets/:id
router.put('/:id', tweetController.editTweet);

// Delete a tweet: DELETE /api/tweets/:id
router.delete('/:id', tweetController.deleteTweet);

// Fetch all timeline tweets: GET /api/tweets/timeline/all
// Note: Registered before /:id to prevent routing clash.
router.get('/timeline/all', tweetController.getTimeline);

// Get a single tweet details: GET /api/tweets/:id
router.get('/:id', tweetController.getTweet);

// Like a tweet: PUT /api/tweets/:id/like
router.put('/:id/like', tweetController.likeTweet);

// Remove like from a tweet: PUT /api/tweets/:id/unlike
router.put('/:id/unlike', tweetController.unlikeTweet);

// Post a reply to a tweet: POST /api/tweets/:id/reply
router.post('/:id/reply', tweetController.replyToTweet);

// Delete a reply from a tweet: DELETE /api/tweets/:tweetId/delete/:replyId
router.delete('/:tweetId/delete/:replyId', tweetController.deleteReply);

// Retweet a tweet: PUT /api/tweets/:id/retweet
router.put('/:id/retweet', tweetController.retweet);

// Remove retweet: PUT /api/tweets/:id/retweet/remove
router.put('/:id/retweet/remove', tweetController.removeRetweet);

// Bookmark a tweet: PUT /api/tweets/:id/bookmark
router.put('/:id/bookmark', tweetController.bookmarkTweet);

// Remove a tweet from bookmarks: PUT /api/tweets/:id/bookmark/remove
router.put('/:id/bookmark/remove', tweetController.removeBookmark);

// Get list of users who liked a tweet: GET /api/tweets/:id/likes
router.get('/:id/likes', tweetController.getTweetLikes);

// Get list of users who retweeted a tweet: GET /api/tweets/:id/retweets
router.get('/:id/retweets', tweetController.getTweetRetweets);

module.exports = router;
