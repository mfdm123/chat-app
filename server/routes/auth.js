const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            username,
            password: hashedPassword
        });
        res.status(201).json({ message: 'Resgistration successful.', userId: user._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message : 'Registration failed.', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        //Find the user
        const user = await User.findOne({ username });
        if (!user) {
            res.status(400).json({ message: "User doesn't exist." });
        }

        //Vertify the password.
        const isMacth = await bcrypt.compare(password, user.password);
        if (!isMacth) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }

        //Create token.
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ message: 'Login successful.', token, username, userId: user._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Login failed.', error: error.message });
    }
});

//Login by token.
router.get('/users/me', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    let userId;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        console.log('Error:', error.message);
        return res.status(401).json({ message: 'Unauthorized.', error: error.message });
    }
    
    try {
        const user = await User.findById(userId);
        res.status(201).json({ message: 'Login sccessful.', user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Create group failed.", error: error.message });
    }
});

module.exports = router;