/**
 * @file app.js
 * @description Configures the Express application instance, mounts general middlewares,
 * serves static files (e.g., uploaded media), and registers API endpoints for both the
 * Twitter and Instagram Post Composer components.
 * 
 * Separating the Express application setup from server boot (index.js) makes the 
 * codebase modular and ready for test runners (like Jest/Supertest).
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Route modules
const authRoutes = require('./routes/authRoute');
const tweetRoutes = require('./routes/tweetRoute');
const userRoutes = require('./routes/userRoute');
const composerRoutes = require('./routes/composerRoute');

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARES CONFIGURATION
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS) for frontend-backend communication
app.use(cors());

// Parse incoming request bodies containing JSON payload
app.use(express.json());

// Parse URL-encoded payloads (form submissions)
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. STATIC FILES SERVING
// ==========================================

// Serve local upload files (media attachments) under the '/public/uploads' endpoint
app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Serve frontend static assets from the 'client' directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// ==========================================
// 3. API ROUTES MOUNTING
// ==========================================

// Twitter Auth routes (login, signup, forgot password)
app.use('/api/auth', authRoutes);

// Twitter Tweet routes (post, delete, like, reply, retweet, bookmark)
app.use('/api/tweets', tweetRoutes);

// Twitter User routes (profile details, followers, follow/unfollow)
app.use('/api/users', userRoutes);

// Instagram Composer routes (get composer posts, draft posts with media upload)
app.use('/api/composer-posts', composerRoutes);

// ==========================================
// 4. ERROR HANDLING MIDDLEWARE
// ==========================================

// General fallback error handler to catch unhandled application errors
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
  });
});

module.exports = app;
