const express = require('express');
const router = express.Router();
const { sendWelcomeEmail } = require('../utils/emailHelper');

// @route   POST /api/auth/welcome-email
// @desc    Send a welcome email to the user
// @access  Public
router.post('/welcome-email', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    try {
        await sendWelcomeEmail(email, name);
        res.json({ msg: 'Welcome email sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error while sending email');
    }
});

module.exports = router;
