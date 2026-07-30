/**
 * verify-endpoints.js
 * Programmatic offline verification script using in-memory mocked models to test controller logic.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');

// Mock Mongoose connection
mongoose.connect = async () => {
  console.log("✅ Mock MongoDB connection established");
  return Promise.resolve();
};
Object.defineProperty(mongoose.connection, 'readyState', {
  get: () => 1,
  configurable: true
});
mongoose.disconnect = async () => {
  console.log("🔌 Mock MongoDB disconnected");
  return Promise.resolve();
};

const bcrypt = require('bcryptjs');
const hashedPass = bcrypt.hashSync("password123", 10);

// In-Memory Database
const mockUsers = [
  {
    _id: "60c72b2f9b1d8e1234567890",
    email: "composer@twitter.com",
    username: "twitter_composer",
    password: hashedPass,
    displayName: "Twitter Composer",
    bio: "Automated post composer workspace for Twitter.",
    followers: [],
    following: [],
    tweets: ["60c72c2f9b1d8e1234567890"],
    likes: [],
    retweets: [],
    bookmarks: []
  },
  {
    _id: "60c72b2f9b1d8e1234567891",
    email: "react_dev@twitter.com",
    username: "react_dev",
    password: hashedPass,
    displayName: "React Developer",
    bio: "Frontend engineering and React lover.",
    followers: [],
    following: [],
    tweets: [],
    likes: [],
    retweets: [],
    bookmarks: []
  }
];

// Initialize non-circular _doc properties for Mongoose compatibility
mockUsers.forEach(u => {
  const clone = { ...u };
  u._doc = clone;
});

const mockTweets = [
  {
    _id: "60c72c2f9b1d8e1234567890",
    userId: "60c72b2f9b1d8e1234567890",
    text: "Just launched the new unified Post Composer dashboard!",
    reply: false,
    likes: ["60c72b2f9b1d8e1234567891"],
    retweets: [],
    replies: []
  },
  {
    _id: "60c72c2f9b1d8e1234567891",
    userId: "60c72b2f9b1d8e1234567891",
    text: "The new Instagram creator modal looks extremely clean.",
    reply: false,
    likes: [],
    retweets: [],
    replies: []
  }
];

const mockComposerPosts = [];

// Mock Classes
class MockUser {
  constructor(data) {
    Object.assign(this, data);
    this._doc = { ...data };
  }
  
  async save() {
    if (!this._id) {
      this._id = "mock_user_" + Date.now();
    }
    this._doc = { ...this };
    delete this._doc._doc; // remove nested doc
    mockUsers.push(this);
    return this;
  }
  
  static async findById(id) {
    const user = mockUsers.find(u => u._id === String(id));
    return user ? new MockUser(user) : null;
  }
  
  static async findOne(query) {
    let user;
    if (query.username) {
      user = mockUsers.find(u => u.username === query.username);
    } else if (query.email) {
      user = mockUsers.find(u => u.email === query.email);
    }
    return user ? new MockUser(user) : null;
  }
  
  static async findByIdAndUpdate(id, update, options) {
    const user = mockUsers.find(u => u._id === String(id));
    if (!user) return null;
    
    if (update.$push) {
      for (const key in update.$push) {
        if (!user[key]) user[key] = [];
        user[key].push(update.$push[key]);
      }
    }
    if (update.$pull) {
      for (const key in update.$pull) {
        if (user[key]) {
          user[key] = user[key].filter(item => String(item) !== String(update.$pull[key]));
        }
      }
    }
    if (update.$set) {
      Object.assign(user, update.$set);
    }
    
    // update _doc clone
    user._doc = { ...user };
    delete user._doc._doc;
    
    return new MockUser(user);
  }
  
  static async findByIdAndDelete(id) {
    const idx = mockUsers.findIndex(u => u._id === String(id));
    if (idx === -1) return null;
    const deleted = mockUsers.splice(idx, 1)[0];
    return new MockUser(deleted);
  }
}

class MockTweet {
  constructor(data) {
    Object.assign(this, data);
  }
  
  async save() {
    if (!this._id) {
      this._id = "mock_tweet_" + Date.now();
    }
    if (!this.likes) this.likes = [];
    if (!this.retweets) this.retweets = [];
    if (!this.replies) this.replies = [];
    mockTweets.push(this);
    return this;
  }
  
  static async find(query) {
    let list = mockTweets;
    if (query) {
      if (query.reply === false) {
        list = list.filter(t => !t.reply);
      }
      if (query.userId) {
        list = list.filter(t => t.userId === query.userId);
      }
    }
    return list.map(t => new MockTweet(t));
  }
  
  static async findById(id) {
    const tweet = mockTweets.find(t => t._id === String(id));
    return tweet ? new MockTweet(tweet) : null;
  }
  
  static async findByIdAndUpdate(id, update, options) {
    const tweet = mockTweets.find(t => t._id === String(id));
    if (!tweet) return null;
    
    if (update.$push) {
      for (const key in update.$push) {
        if (!tweet[key]) tweet[key] = [];
        tweet[key].push(update.$push[key]);
      }
    }
    if (update.$pull) {
      for (const key in update.$pull) {
        if (tweet[key]) {
          tweet[key] = tweet[key].filter(item => String(item) !== String(update.$pull[key]));
        }
      }
    }
    if (update.$set) {
      Object.assign(tweet, update.$set);
    }
    return new MockTweet(tweet);
  }
  
  static async findByIdAndDelete(id) {
    const idx = mockTweets.findIndex(t => t._id === String(id));
    if (idx === -1) return null;
    const deleted = mockTweets.splice(idx, 1)[0];
    return new MockTweet(deleted);
  }
}

class MockComposerPost {
  constructor(data) {
    Object.assign(this, data);
  }
  
  static find() {
    return {
      sort: () => Promise.resolve(mockComposerPosts.map(p => new MockComposerPost(p)))
    };
  }
  
  static async create(data) {
    const post = {
      _id: "mock_post_" + Date.now(),
      ...data
    };
    mockComposerPosts.push(post);
    return new MockComposerPost(post);
  }
  
  static async findById(id) {
    const post = mockComposerPosts.find(p => p._id === String(id));
    return post ? new MockComposerPost(post) : null;
  }
  
  static async findByIdAndUpdate(id, update, options) {
    const post = mockComposerPosts.find(p => p._id === String(id));
    if (!post) return null;
    Object.assign(post, update);
    return new MockComposerPost(post);
  }
  
  static async findByIdAndDelete(id) {
    const idx = mockComposerPosts.findIndex(p => p._id === String(id));
    if (idx === -1) return null;
    const deleted = mockComposerPosts.splice(idx, 1)[0];
    return new MockComposerPost(deleted);
  }
}

// Inject mocks into require.cache
const userModelPath = require.resolve('./models/User');
const tweetModelPath = require.resolve('./models/Tweet');
const composerPostModelPath = require.resolve('./models/ComposerPost');

require.cache[userModelPath] = {
  id: userModelPath,
  filename: userModelPath,
  loaded: true,
  exports: MockUser
};
require.cache[tweetModelPath] = {
  id: tweetModelPath,
  filename: tweetModelPath,
  loaded: true,
  exports: MockTweet
};
require.cache[composerPostModelPath] = {
  id: composerPostModelPath,
  filename: composerPostModelPath,
  loaded: true,
  exports: MockComposerPost
};

// Import App Layer
const app = require('./app');

const PORT = 5001;
let server;

// Helpers to make HTTP requests
function makeGetRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const url = `http://localhost:${PORT}${endpoint}`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          body: parsed
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function makePostRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const postData = JSON.stringify(body);
    
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          body: parsed
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

function withTimeout(promise, timeoutMs, endpoint) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout of ${timeoutMs}ms exceeded on ${endpoint}`)), timeoutMs)
    )
  ]);
}

async function runTests() {
  console.log("🔄 Starting In-Memory Verification Tests...");
  
  // 1. Start test server
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`✅ Test server running on port ${PORT}`);
      resolve();
    });
  });

  const getTests = [
    // Timeline check
    {
      name: "GET /api/tweets/timeline/all",
      endpoint: "/api/tweets/timeline/all",
      expectedStatus: 200,
      validate: (res) => Array.isArray(res.body) && res.body.length > 0
    },
    // Active User profile check
    {
      name: "GET /api/users/active/60c72b2f9b1d8e1234567890",
      endpoint: "/api/users/active/60c72b2f9b1d8e1234567890",
      expectedStatus: 200,
      validate: (res) => res.body && res.body._id === "60c72b2f9b1d8e1234567890"
    },
    // General user profile check (hides private details)
    {
      name: "GET /api/users/60c72b2f9b1d8e1234567890",
      endpoint: "/api/users/60c72b2f9b1d8e1234567890",
      expectedStatus: 200,
      validate: (res) => res.body && res.body.username === "twitter_composer" && res.body.email === undefined
    },
    // Crash prevention check (Non-existent user lookup)
    {
      name: "GET /api/users/60c72b2f9b1d8e9999999999 (Non-existent User - returns 404, no crash)",
      endpoint: "/api/users/60c72b2f9b1d8e9999999999",
      expectedStatus: 404,
      validate: (res) => res.body === "User not found"
    },
    // Hang prevention check (User followers - empty list)
    {
      name: "GET /api/users/60c72b2f9b1d8e1234567890/followers (Empty List - returns [], no hang)",
      endpoint: "/api/users/60c72b2f9b1d8e1234567890/followers",
      expectedStatus: 200,
      validate: (res) => Array.isArray(res.body) && res.body.length === 0
    },
    // Hang prevention check (User following - empty list)
    {
      name: "GET /api/users/60c72b2f9b1d8e1234567890/following (Empty List - returns [], no hang)",
      endpoint: "/api/users/60c72b2f9b1d8e1234567890/following",
      expectedStatus: 200,
      validate: (res) => Array.isArray(res.body) && res.body.length === 0
    },
    // Success check (Tweet likes lookup - populated list)
    {
      name: "GET /api/tweets/60c72c2f9b1d8e1234567890/likes (Populated List)",
      endpoint: "/api/tweets/60c72c2f9b1d8e1234567890/likes",
      expectedStatus: 200,
      validate: (res) => Array.isArray(res.body) && res.body.length === 1 && res.body[0].username === "react_dev"
    },
    // Hang prevention check (Tweet likes lookup - empty list)
    {
      name: "GET /api/tweets/60c72c2f9b1d8e1234567891/likes (Empty List - returns [], no hang)",
      endpoint: "/api/tweets/60c72c2f9b1d8e1234567891/likes",
      expectedStatus: 200,
      validate: (res) => Array.isArray(res.body) && res.body.length === 0
    },
    // Composer posts list
    {
      name: "GET /api/composer-posts",
      endpoint: "/api/composer-posts",
      expectedStatus: 200,
      validate: (res) => Array.isArray(res.body)
    }
  ];

  let passed = 0;
  
  // Run GET tests
  for (const tc of getTests) {
    try {
      const res = await withTimeout(makeGetRequest(tc.endpoint), 2000, tc.endpoint);
      const statusMatch = res.statusCode === tc.expectedStatus;
      const bodyValid = tc.validate ? tc.validate(res) : true;
      
      if (statusMatch && bodyValid) {
        console.log(`   ✅ Passed: ${tc.name}`);
        passed++;
      } else {
        console.error(`   ❌ Failed: ${tc.name}`);
        console.error(`      Expected Status: ${tc.expectedStatus}, Got: ${res.statusCode}`);
        console.error(`      Body:`, res.body);
      }
    } catch (err) {
      console.error(`   ❌ Error in test ${tc.name}:`, err.message);
    }
  }

  // Run POST Auth Login test
  try {
    const loginPayload = {
      userLoginDetail: "twitter_composer",
      password: "password123"
    };
    console.log("🔄 Testing POST /api/auth/login...");
    const res = await withTimeout(makePostRequest("/api/auth/login", loginPayload), 2000, "/api/auth/login");
    if (res.statusCode === 200 && res.body && res.body.username === "twitter_composer") {
      console.log("   ✅ Passed: POST /api/auth/login");
      passed++;
    } else {
      console.error("   ❌ Failed: POST /api/auth/login");
      console.error("      Got Status:", res.statusCode, "Body:", res.body);
    }
  } catch (err) {
    console.error("   ❌ Error in login test:", err.message);
  }

  console.log(`\n📊 Verification Results: ${passed}/${getTests.length + 1} tests passed.`);
  
  // Cleanup
  server.close(() => {
    console.log("🔌 Test server closed");
  });
  
  if (passed !== getTests.length + 1) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
