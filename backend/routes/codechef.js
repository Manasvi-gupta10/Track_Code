const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// @route   GET /api/codechef/:username
// @desc    Get CodeChef profile data via scraping
router.get('/:username', async (req, res) => {
    console.log(`Scraping CodeChef profile for: ${req.params.username}`);
    try {
        const { username } = req.params;
        const url = `https://www.codechef.com/users/${username}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Check if user exists
        if ($('.error-header').length > 0) {
            return res.status(404).json({ msg: 'User not found on CodeChef' });
        }

        const data = {
            name: $('.m-username--m-container .user-details-container h1').text().trim() || username,
            currentRating: parseInt($('.rating-number').first().text()) || 0,
            stars: $('.rating-star span').length > 0 ? $('.rating-star span').length + '★' : '1★',
            highestRating: parseInt($('.rating-header small').text().replace(/[^\d]/g, '')) || 0,
            globalRank: $('.rating-ranks ul li').first().find('strong').text() || 'N/A',
            countryRank: $('.rating-ranks ul li').last().find('strong').text() || 'N/A',
            profile: $('.user-details-container img').attr('src') || null,
            contestsParticipated: $('.contest-participated-count b').text() || '0'
        };

        console.log(`Successfully scraped CodeChef data for ${username}`);
        res.json(data);
    } catch (err) {
        console.error('CodeChef Scraping Error:', err.message);
        res.status(500).json({ error: 'Failed to scrape CodeChef profile', details: err.message });
    }
});

module.exports = router;
