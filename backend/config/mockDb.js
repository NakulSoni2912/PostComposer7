const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Generate a valid bcrypt hash for simulated login capability (matches verify-endpoints.js)
const mockPasswordHash = bcrypt.hashSync("password123", 10);

const store = {
  users: [
    {
      _id: "60c72b2f9b1d8e1234567890",
      email: "composer@twitter.com",
      username: "twitter_composer",
      password: mockPasswordHash,
      displayName: "Twitter Composer",
      bio: "Automated post composer workspace for Twitter.",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      following: ["60c72b2f9b1d8e1234567891", "60c72b2f9b1d8e1234567892"],
      followers: [],
      tweets: [],
      likes: [],
      retweets: [],
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "60c72b2f9b1d8e1234567891",
      email: "react_dev@twitter.com",
      username: "react_dev",
      password: mockPasswordHash,
      displayName: "React Developer",
      bio: "Frontend engineering and React lover.",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      following: [],
      followers: ["60c72b2f9b1d8e1234567890"],
      tweets: [],
      likes: [],
      retweets: [],
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "60c72b2f9b1d8e1234567892",
      email: "mongodb_fan@twitter.com",
      username: "mongodb_fan",
      password: mockPasswordHash,
      displayName: "MongoDB Fan",
      bio: "NoSQL databases expert.",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      following: [],
      followers: ["60c72b2f9b1d8e1234567890"],
      tweets: [],
      likes: [],
      retweets: [],
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  tweets: [
    {
      _id: "60c72c2f9b1d8e1234567890",
      userId: "60c72b2f9b1d8e1234567890",
      text: "Just launched the new unified Ur Posts dashboard! Now you can easily manage Instagram, Twitter, and Reddit from a single glassmorphic workspace. 🚀 #MERN #FullStack",
      reply: false,
      likes: ["60c72b2f9b1d8e1234567891", "60c72b2f9b1d8e1234567892"],
      retweets: [],
      replies: [],
      createdAt: new Date(Date.now() - 3600000 * 2),
      updatedAt: new Date(Date.now() - 3600000 * 2)
    },
    {
      _id: "60c72c2f9b1d8e1234567891",
      userId: "60c72b2f9b1d8e1234567891",
      text: "The new Instagram creator modal looks extremely clean. Bypassing the login screen for Twitter workspace makes editing draft posts so much faster!",
      reply: false,
      likes: ["60c72b2f9b1d8e1234567890"],
      retweets: [],
      replies: [],
      createdAt: new Date(Date.now() - 3600000 * 1),
      updatedAt: new Date(Date.now() - 3600000 * 1)
    },
    {
      _id: "60c72c2f9b1d8e1234567892",
      userId: "60c72b2f9b1d8e1234567892",
      text: "MERN split architecture (Express backend + React frontend) is definitely the way to go for future scalability. Easy to maintain and package separately. 💻",
      reply: false,
      likes: ["60c72b2f9b1d8e1234567890", "60c72b2f9b1d8e1234567891"],
      retweets: ["60c72b2f9b1d8e1234567890"],
      replies: [],
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(Date.now() - 1800000)
    }
  ],
  composerposts: [
    {
      _id: "60c72d2f9b1d8e1234567890",
      platform: "instagram",
      title: "Interactive UI Redesign",
      description: "Sneak peek of the redesigned glassmorphic landing page and sliding tab components for Ur Posts! Aesthetic, interactive, and fast. ✨ #uiux #designsystem #webdev",
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      mediaName: "preview.jpg",
      status: "posted",
      createdAt: new Date(Date.now() - 3600000 * 5),
      updatedAt: new Date(Date.now() - 3600000 * 5)
    },
    {
      _id: "60c72d2f9b1d8e1234567891",
      platform: "instagram",
      title: "Aesthetics Matter",
      description: "Drafting the next update layout: adding motion-driven scrolling, high-fidelity color presets, and rich visual telemetry tools.",
      mediaUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      mediaName: "setup.jpg",
      status: "draft",
      createdAt: new Date(Date.now() - 3600000 * 12),
      updatedAt: new Date(Date.now() - 3600000 * 12)
    }
  ]
};

// Helper function to match mongoose query criteria
function matchesQuery(item, query) {
  if (!query) return true;
  for (const key in query) {
    const val = query[key];
    if (val instanceof RegExp) {
      if (!val.test(item[key])) return false;
    } else if (val && typeof val === 'object') {
      if (val.$in) {
        const itemVal = item[key] ? item[key].toString() : '';
        const searchList = val.$in.map(v => v.toString());
        if (!searchList.includes(itemVal)) return false;
      } else if (val.$ne) {
        const itemVal = item[key] ? item[key].toString() : '';
        if (itemVal === val.$ne.toString()) return false;
      }
    } else {
      const itemVal = item[key] ? item[key].toString() : '';
      const queryVal = val ? val.toString() : '';
      if (itemVal !== queryVal) return false;
    }
  }
  return true;
}

// Generate Mongoose-like decorated promise
function makeQueryPromise(promiseCreator) {
  const promise = new Promise((resolve, reject) => {
    promiseCreator(resolve, reject);
  });

  promise.sort = function(sortArg) {
    return makeQueryPromise((resolve, reject) => {
      promise.then(data => {
        if (!Array.isArray(data)) return resolve(data);
        const sorted = [...data];
        let sortField = 'createdAt';
        let direction = -1; // desc by default
        
        if (typeof sortArg === 'string') {
          if (sortArg.startsWith('-')) {
            sortField = sortArg.substring(1);
            direction = -1;
          } else {
            sortField = sortArg;
            direction = 1;
          }
        } else if (sortArg && typeof sortArg === 'object') {
          const keys = Object.keys(sortArg);
          if (keys.length > 0) {
            sortField = keys[0];
            direction = sortArg[sortField] === -1 ? -1 : 1;
          }
        }
        
        sorted.sort((a, b) => {
          const aVal = a[sortField] || 0;
          const bVal = b[sortField] || 0;
          if (aVal < bVal) return -1 * direction;
          if (aVal > bVal) return 1 * direction;
          return 0;
        });
        resolve(sorted);
      }).catch(reject);
    });
  };

  promise.populate = function(field) {
    return makeQueryPromise((resolve, reject) => {
      promise.then(data => {
        const populateItem = (item) => {
          if (!item) return item;
          const cloned = { ...item };
          if (field === 'userId' && cloned.userId) {
            const userIdStr = cloned.userId.toString();
            const user = store.users.find(u => u._id.toString() === userIdStr);
            cloned.userId = user ? { ...user } : cloned.userId;
          }
          return cloned;
        };

        if (Array.isArray(data)) {
          resolve(data.map(populateItem));
        } else {
          resolve(populateItem(data));
        }
      }).catch(reject);
    });
  };

  promise.exec = function() {
    return promise;
  };

  return promise;
}

// Attach _doc hidden compatibility property to returned document
function decorateDoc(item) {
  if (!item) return null;
  const doc = {
    ...item,
    toObject: function() { return this; },
    toJSON: function() { return this; }
  };
  Object.defineProperty(doc, '_doc', {
    value: doc,
    enumerable: false,
    writable: true,
    configurable: true
  });
  return doc;
}

// Monkey-patch Model logic
function initializeFallback(Model, collectionName) {
  const originalFind = Model.find;
  const originalFindOne = Model.findOne;
  const originalFindById = Model.findById;
  const originalFindByIdAndUpdate = Model.findByIdAndUpdate;
  const originalFindByIdAndDelete = Model.findByIdAndDelete;
  const originalCreate = Model.create;
  const originalCountDocuments = Model.countDocuments;

  Model.find = function(query) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] find in ${collectionName}`);
      return makeQueryPromise((resolve) => {
        const results = store[collectionName].filter(item => matchesQuery(item, query));
        resolve(results.map(decorateDoc));
      });
    }
    return originalFind.apply(Model, arguments);
  };

  Model.findOne = function(query) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] findOne in ${collectionName}`);
      return makeQueryPromise((resolve) => {
        const result = store[collectionName].find(item => matchesQuery(item, query));
        resolve(decorateDoc(result));
      });
    }
    return originalFindOne.apply(Model, arguments);
  };

  Model.findById = function(id) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] findById in ${collectionName} with id: ${id}`);
      return makeQueryPromise((resolve) => {
        const result = store[collectionName].find(item => item._id.toString() === (id ? id.toString() : ''));
        resolve(decorateDoc(result));
      });
    }
    return originalFindById.apply(Model, arguments);
  };

  Model.findByIdAndUpdate = function(id, update, options) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] findByIdAndUpdate in ${collectionName}`);
      return makeQueryPromise((resolve) => {
        const index = store[collectionName].findIndex(item => item._id.toString() === (id ? id.toString() : ''));
        if (index === -1) return resolve(null);
        
        let updateObj = update;
        // Handle mongoose update operations like $push or $pull if any:
        if (update && (update.$push || update.$pull || update.$addToSet)) {
          const item = store[collectionName][index];
          if (update.$push) {
            for (const key in update.$push) {
              if (Array.isArray(item[key])) {
                item[key].push(update.$push[key]);
              }
            }
          }
          if (update.$pull) {
            for (const key in update.$pull) {
              if (Array.isArray(item[key])) {
                item[key] = item[key].filter(v => v.toString() !== update.$pull[key].toString());
              }
            }
          }
          if (update.$addToSet) {
            for (const key in update.$addToSet) {
              if (Array.isArray(item[key])) {
                if (!item[key].map(v=>v.toString()).includes(update.$addToSet[key].toString())) {
                  item[key].push(update.$addToSet[key]);
                }
              }
            }
          }
          updateObj = {};
        }

        const updated = {
          ...store[collectionName][index],
          ...updateObj,
          updatedAt: new Date()
        };
        store[collectionName][index] = updated;
        resolve(decorateDoc(updated));
      });
    }
    return originalFindByIdAndUpdate.apply(Model, arguments);
  };

  Model.findByIdAndDelete = function(id) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] findByIdAndDelete in ${collectionName}`);
      return makeQueryPromise((resolve) => {
        const index = store[collectionName].findIndex(item => item._id.toString() === (id ? id.toString() : ''));
        if (index === -1) return resolve(null);
        const deleted = store[collectionName].splice(index, 1)[0];
        resolve(decorateDoc(deleted));
      });
    }
    return originalFindByIdAndDelete.apply(Model, arguments);
  };

  Model.create = function(doc) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] create in ${collectionName}`);
      return new Promise((resolve) => {
        const newDoc = {
          _id: doc._id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          ...doc,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        store[collectionName].push(newDoc);
        resolve(decorateDoc(newDoc));
      });
    }
    return originalCreate.apply(Model, arguments);
  };

  Model.countDocuments = function(query) {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[MockDB Fallback] countDocuments in ${collectionName}`);
      return makeQueryPromise((resolve) => {
        const count = store[collectionName].filter(item => matchesQuery(item, query)).length;
        resolve(count);
      });
    }
    return originalCountDocuments.apply(Model, arguments);
  };
}

module.exports = {
  store,
  setupMocks: () => {
    console.log("⚙️ Setting up MockDB fallback for models User, Tweet, ComposerPost...");
    const User = require('../models/User');
    const Tweet = require('../models/Tweet');
    const ComposerPost = require('../models/ComposerPost');

    initializeFallback(User, 'users');
    initializeFallback(Tweet, 'tweets');
    initializeFallback(ComposerPost, 'composerposts');

    // Intercept Mongoose Model save prototype
    const originalSave = mongoose.Model.prototype.save;
    mongoose.Model.prototype.save = function() {
      if (mongoose.connection.readyState !== 1) {
        const modelName = this.constructor.modelName;
        console.log(`[MockDB Fallback] Model.prototype.save for ${modelName}`);
        const collectionName = modelName.toLowerCase() + 's';
        
        const docData = this.toObject();
        if (!docData._id) {
          docData._id = Math.random().toString(36).substring(2, 15);
        }
        docData.createdAt = docData.createdAt || new Date();
        docData.updatedAt = new Date();
        
        const index = store[collectionName].findIndex(item => item._id.toString() === docData._id.toString());
        if (index !== -1) {
          store[collectionName][index] = docData;
        } else {
          store[collectionName].push(docData);
        }
        
        Object.defineProperty(this, '_doc', {
          value: docData,
          enumerable: false,
          writable: true,
          configurable: true
        });
        
        return Promise.resolve(this);
      }
      return originalSave.apply(this, arguments);
    };

    console.log("✅ MockDB fallback setup complete!");
  }
};
