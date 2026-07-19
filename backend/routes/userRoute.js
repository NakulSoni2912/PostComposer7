/**
 * @file userRoute.js
 * @description Express routes for Twitter User operations (profile fetching, updates, following, bookmarks).
 * Maps endpoints to userController logic.
 */

const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Specific routes registered first to avoid clash with general ID routes (/:id)
// Fetch active user profile: GET /api/users/active/:id
router.get('/active/:id', userController.getActiveUser);

// Fetch profile by username string: GET /api/users/username/:username
router.get('/username/:username', userController.getUserByUsername);

// Check username availability: POST /api/users/username
router.post('/username', userController.checkUsernameAvailability);

// Check email availability: POST /api/users/email
router.post('/email', userController.checkEmailAvailability);

// General ID resource routes
// Fetch profile by database ID: GET /api/users/:id
router.get('/:id', userController.getUser);

// Update user details: PUT /api/users/:id
router.put('/:id', userController.updateUser);

// Delete user account: DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

// Follow user: PUT /api/users/:id/follow
router.put('/:id/follow', userController.followUser);

// Unfollow user: PUT /api/users/:id/unfollow
router.put('/:id/unfollow', userController.unfollowUser);

// User data sub-resources
// Fetch tweets posted by user: GET /api/users/:id/tweets
router.get('/:id/tweets', userController.getUserTweets);

// Fetch tweets liked by user: GET /api/users/:id/likes
router.get('/:id/likes', userController.getUserLikes);

// Fetch tweets retweeted by user: GET /api/users/:id/retweets
router.get('/:id/retweets', userController.getUserRetweets);

// Fetch tweets bookmarked by user: GET /api/users/:id/bookmarks
router.get('/:id/bookmarks', userController.getUserBookmarks);

// Clear user bookmarks list: PUT /api/users/:id/bookmarks/clear
router.put('/:id/bookmarks/clear', userController.clearBookmarks);

// Fetch list of user's followers: GET /api/users/:id/followers
router.get('/:id/followers', userController.getUserFollowers);

// Fetch list of users followed by user: GET /api/users/:id/following
router.get('/:id/following', userController.getUserFollowing);

// Validate user password: POST /api/users/password/:id
router.post('/password/:id', userController.validatePassword);

module.exports = router;
