/**
 * @file index.js
 * @description Main entry point for the backend server.
 * 
 * Note: To keep the startup configuration clean and allow isolated integration testing,
 * route definitions and middleware configurations are separated into 'app.js'.
 * Here, we initialize environment variables, connect to the database (and run seeds),
 * and boot up the server.
 */

const path = require('path');
const dotenv = require('dotenv');
// Initialize environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app'); // Express configuration layer (routes, middlewares)
const connectDatabase = require('./config/database'); // Mongoose DB setup & data seeder

// Connect to MongoDB & Seed Initial Mock Data (Active User, Tweets, etc.)
connectDatabase();

// Connect Server and Listen to Incoming Requests
const PORT = process.env.PORT || 5000;
const HOST = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  // console.log("🚀 Server Started");
  console.log(`Server is running on port ${PORT}`);
  console.log(`- API Routes configured inside app.js`);
  console.log(`- Twitter Auth: ${HOST}/api/auth`);
  console.log(`- Twitter Tweets: ${HOST}/api/tweets`);
  console.log(`- Twitter Users: ${HOST}/api/users`);
  console.log(`- Instagram Composer: ${HOST}/api/composer-posts`);
});