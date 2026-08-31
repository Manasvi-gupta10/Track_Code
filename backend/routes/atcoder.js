const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   GET /api/atcoder/submissions/:username
// @desc    Get AtCoder submissions via Kenkoooo API
router.get('/submissions/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${username}&from_second=0`);
        res.json(response.data);
    } catch (err) {
        console.error('AtCoder Submissions Error:', err.message);
        res.status(500).json({ msg: 'Failed to fetch AtCoder submissions' });
    }
});

// @route   GET /api/atcoder/profile/:username
// @desc    Get AtCoder profile page (proxy to avoid CORS)
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(`https://atcoder.jp/users/${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        // We just return success if the page exists, or we could parse it here
        // For now, let's just confirm the user exists
        res.json({ msg: 'User exists', username });
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ msg: 'User not found' });
        }
        console.error('AtCoder Profile Error:', err.message);
        res.status(500).json({ msg: 'Failed to fetch AtCoder profile' });
    }
});

module.exports = router;
