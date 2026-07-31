const mongoose = require('mongoose');
const dns = require('dns');

const connectDatabase = () => {
    // Fallback DNS configuration for environments where local DNS returns loopback/empty lists (e.g. Windows Node.js c-ares issue)
    const servers = dns.getServers();
    if (servers.length === 0 || (servers.length === 1 && (servers[0] === '127.0.0.1' || servers[0] === '::1'))) {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    }

    mongoose.set('strictQuery', true);
    console.log("🔄 Connecting to MongoDB Atlas...");
    mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL)
    .then(async () => {
        console.log("✅ MongoDB Atlas Connected Successfully");
        console.log("Mongoose Connected");
        await seedMockData();
    }).catch((error) => {
        console.error("❌ MongoDB Atlas Connection Failed:", error);
        console.log("Database connection error:", error);
        try {
            const mockDb = require('./mockDb');
            mockDb.setupMocks();
        } catch (mockErr) {
            console.error("❌ Failed to initialize MockDB fallback:", mockErr);
        }
    });
}

async function seedMockData() {
    try {
        const User = require('../models/User');
        const Tweet = require('../models/Tweet');
        
        // 1. Seed active user
        const activeUserExists = await User.findById("60c72b2f9b1d8e1234567890");
        if (!activeUserExists) {
            await User.create({
                _id: "60c72b2f9b1d8e1234567890",
                email: "composer@twitter.com",
                username: "twitter_composer",
                password: "dummy_password_hash",
                displayName: "Twitter Composer",
                bio: "Automated post composer workspace for Twitter."
            });
            console.log("Seeded mock active user");
        }
        
        // 2. Seed other mock users
        const user2Exists = await User.findById("60c72b2f9b1d8e1234567891");
        if (!user2Exists) {
            await User.create({
                _id: "60c72b2f9b1d8e1234567891",
                email: "react_dev@twitter.com",
                username: "react_dev",
                password: "dummy_password_hash",
                displayName: "React Developer",
                bio: "Frontend engineering and React lover."
            });
        }
        const user3Exists = await User.findById("60c72b2f9b1d8e1234567892");
        if (!user3Exists) {
            await User.create({
                _id: "60c72b2f9b1d8e1234567892",
                email: "mongodb_fan@twitter.com",
                username: "mongodb_fan",
                password: "dummy_password_hash",
                displayName: "MongoDB Fan",
                bio: "NoSQL databases expert."
            });
        }

        // 3. Seed mock tweets
        const tweet1Exists = await Tweet.findById("60c72c2f9b1d8e1234567890");
        if (!tweet1Exists) {
            await Tweet.create({
                _id: "60c72c2f9b1d8e1234567890",
                userId: "60c72b2f9b1d8e1234567890",
                text: "Just launched the new unified Post Composer dashboard! Now you can easily manage Instagram, Twitter, and Reddit from a single light-themed workspace. 🚀 #MERN #FullStack",
                reply: false,
                likes: ["60c72b2f9b1d8e1234567891", "60c72b2f9b1d8e1234567892"],
                retweets: []
            });
            console.log("Seeded mock tweet 1");
        }
        const tweet2Exists = await Tweet.findById("60c72c2f9b1d8e1234567891");
        if (!tweet2Exists) {
            await Tweet.create({
                _id: "60c72c2f9b1d8e1234567891",
                userId: "60c72b2f9b1d8e1234567891",
                text: "The new Instagram creator modal looks extremely clean. Bypassing the login screen for Twitter workspace makes editing draft posts so much faster!",
                reply: false,
                likes: ["60c72b2f9b1d8e1234567890"]
            });
        }
        const tweet3Exists = await Tweet.findById("60c72c2f9b1d8e1234567892");
        if (!tweet3Exists) {
            await Tweet.create({
                _id: "60c72c2f9b1d8e1234567892",
                userId: "60c72b2f9b1d8e1234567892",
                text: "MERN split architecture (Express backend + React frontend) is definitely the way to go for future scalability. Easy to maintain and package separately. 💻",
                reply: false,
                likes: ["60c72b2f9b1d8e1234567890", "60c72b2f9b1d8e1234567891"],
                retweets: ["60c72b2f9b1d8e1234567890"]
            });
        }
    } catch (err) {
        console.error("Database seeding failed:", err);
    }
}

module.exports = connectDatabase;
