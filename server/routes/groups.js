const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Group = require('../models/Group');
const Message = require('../models/Message');

const router = express.Router();

//Create a group.
router.post('/', async (req, res) => {
    const { name } = req.body;
    let owner = null;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        owner = decoded.userId;
    } catch (error) {
        console.log('Error:', error.message);
        return res.status(401).json({ message: 'Unauthorized.', error: error.message });
    }

    try {
        const code = crypto.randomBytes(4).toString('hex');

        const group = await Group.create({
            name,
            code,
            owner,
            members: [new mongoose.Types.ObjectId(owner)]
        });
        const savedGroup = await Group.findById(group._id).populate('members', 'username');
        res.status(201).json({ group: savedGroup, message: 'Create group sccessful.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Create group failed.", error: error.message });
    }
});

//Get all groups.
router.get('/', async (req, res) => {
    let userId;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', errpr: error.message });
    }

    try {
        const groups = await Group.find({ members: new mongoose.Types.ObjectId(userId) }).populate('members', 'username');
        res.json(groups);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Get groups failed.', error: error.message });
    }
});

//Get group's messages.
router.get('/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;
    let userId;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', errpr: error.message });
    }
    
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        
        if (!group.members.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const messages = await Message.find({ groupId }).populate('sender', 'username');

        res.json(messages);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to join the group.', error: error.message });
    }
});

//Join a group by code.
router.post('/join', async (req, res) => {
    const { code } = req.body;
    let userId;
    console.log(req.headers);
    
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }

    try {
        const group = await Group.findOne({ code });
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        
        if (group.members.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(400).json({ message: 'Already in the group.' });
        }

        group.members.push(new mongoose.Types.ObjectId(userId));
        await group.save();

        const savedGroup = await Group.findById(group._id).populate('members', 'username');

        res.json({ message: 'Join the group successful.', group: savedGroup });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to join the group.', error: error.message });
    }
});

//Delete a group by id.
router.delete('/:id', async (req, res) => {
    let userId;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const coded = jwt.verify(token, process.env.JWT_SECRET);
        userId = coded.userId;
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', errpr: error.message });
    }

    try {
        const groupId = req.params.id;
        const group = await Group.findById(groupId);

        if (group.owner.toString() !== userId) {
            return res.status(401).json({ message: `You're not the owner of the group.` });
        }

        await Group.deleteOne(group);
        res.json({ message: 'Delete the group successful.' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Failed to delete the group.', error: error.message });
    }
});

// router.delete('/all', async (req, res) => {
//   await Group.deleteMany({});
//   res.json({ message: 'All groups deleted' });
// });

module.exports = router;