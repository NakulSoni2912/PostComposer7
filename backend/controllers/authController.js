const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create user
exports.signup = async (req, res) => {
    try {
        // Check if username is taken
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            res.status(403).json('Username already taken');
        } else {
            // Generate new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Create new user
            const newUser = new User({
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword,
                displayName: req.body.displayName
            });

            // Save new user and send back user object
            const user = await newUser.save();
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Check if email is already in use
exports.signupEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            res.status(403).json('Email has already been taken.');
        } else {
            res.status(200).json('Email is available');
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Validate user
exports.login = async (req, res) => {
    try {
        let user = {};
        // Check if user exists
        // Check if request uses email or username
        if (req.body.userLoginDetail.includes('@')) {
            user = await User.findOne({ email: req.body.userLoginDetail });
        } else {
            user = await User.findOne({ username: req.body.userLoginDetail });
        }
        
        if (!user) {
            res.status(404).json('User not found');
        } else {
            // Check for valid password
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                res.status(406).json("Incorrect password");
            } else {
                // Send back user object
                res.status(200).json(user);
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Validate email or username (forgot password)
exports.forgotPassword = async (req, res) => {
    try {
        let user = {};
        // Check if user exists
        // Check if request uses email or username
        if (req.body.userDetail.includes('@')) {
            user = await User.findOne({ email: req.body.userDetail });
        } else {
            user = await User.findOne({ username: req.body.userDetail });
        }
        
        if (!user) {
            res.status(404).json('User not found');
        } else {
            res.status(200).json('Reset link sent');
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
