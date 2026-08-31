const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   GET /api/leetcode/:username
// @desc    Get LeetCode profile data
router.get('/:username', async (req, res) => {
    console.log(`Fetching LeetCode profile for: ${req.params.username}`);
    try {
        const { username } = req.params;

        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    githubUrl
                    twitterUrl
                    linkedinUrl
                    profile {
                        realName
                        userAvatar
                        aboutMe
                        school
                        websites
                        countryName
                        company
                        jobTitle
                        skillTags
                        postViewCount
                        reputation
                        ranking
                    }
                    badges {
                        id
                        name
                        shortName
                        displayName
                        icon
                    }
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                        totalSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
                userContestRanking(username: $username) {
                    attendedContestsCount
                    rating
                    globalRanking
                    topPercentage
                    totalParticipants
                }
                recentSubmissionList(username: $username, limit: 10) {
                    title
                    titleSlug
                    timestamp
                    statusDisplay
                    lang
                }
            }
        `;

        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (response.data.errors) {
            console.error('LeetCode Errors:', response.data.errors);
            // If we have matchedUser, return the data despite errors (often partial data)
            if (!response.data.data || !response.data.data.matchedUser) {
                return res.status(404).json({ msg: 'User not found', details: response.data.errors });
            }
        }

        if (!response.data.data || !response.data.data.matchedUser) {
            console.log(`User ${username} not found in LeetCode response.`);
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log(`Successfully fetched data for ${username}`);
        res.json(response.data.data);
    } catch (err) {
        console.error('LeetCode API Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
