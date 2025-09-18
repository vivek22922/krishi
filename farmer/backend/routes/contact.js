// routes/contact.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// @route   POST api/contact
// @desc    Submit a contact form message
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const newMessage = new Message({ name, email, message });
        await newMessage.save();
        res.json({ msg: 'Message sent successfully! We will get back to you soon.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;