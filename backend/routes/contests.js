const express = require('express');
const router = express.Router();
const axios = require('axios');
const { fetchUpcomingContests, fetchRecentContests } = require('@qatadaazzeh/atcoder-api');

// @route   GET /api/contests/atcoder
// @desc    Get AtCoder upcoming and recent contests
router.get('/atcoder', async (req, res) => {
    try {
        const [upcoming, recent] = await Promise.all([
            fetchUpcomingContests(),
            fetchRecentContests()
        ]);
        res.json({ upcoming, recent });
    } catch (error) {
        console.error('AtCoder Backend Error:', error);
        res.status(500).json({ message: 'Error fetching AtCoder contests', error: error.message });
    }
});

// @route   GET /api/contests/upcoming-summary
// @desc    Get total count and top 3 upcoming contests across platforms
router.get('/upcoming-summary', async (req, res) => {
    console.log('GET /api/contests/upcoming-summary hit');
    try {
        let totalCount = 0;
        let allUpcoming = [];

        // Fetch counts from multiple platforms in parallel
        const results = await Promise.allSettled([
            // AtCoder
            fetchUpcomingContests().then(list => {
                const contests = (list || []).map(c => ({
                    name: c.contestName,
                    platform: 'AtCoder',
                    date: new Date(c.contestTime).toLocaleDateString(),
                    startTime: new Date(c.contestTime).getTime()
                }));
                return contests;
            }),
            
            // Codeforces
            axios.get('https://codeforces.com/api/contest.list')
                .then(res => {
                    if (res.data.status === 'OK') {
                        return res.data.result
                            .filter(c => c.phase === 'BEFORE')
                            .map(c => ({
                                name: c.name,
                                platform: 'Codeforces',
                                date: new Date(c.startTimeSeconds * 1000).toLocaleDateString(),
                                startTime: c.startTimeSeconds * 1000
                            }));
                    }
                    return [];
                }),
            
            // LeetCode
            axios.get('https://competeapi.vercel.app/contests/leetcode/')
                .then(res => (res.data?.data?.topTwoContests || []).map(c => ({
                    name: c.title,
                    platform: 'LeetCode',
                    date: new Date(c.startTime * 1000).toLocaleDateString(),
                    startTime: c.startTime * 1000
                }))),
            
            // CodeChef
            axios.get('https://competeapi.vercel.app/contests/codechef/')
                .then(res => (res.data?.future_contests || []).map(c => ({
                    name: c.contest_name,
                    platform: 'CodeChef',
                    date: new Date(c.contest_start_date).toLocaleDateString(),
                    startTime: new Date(c.contest_start_date).getTime()
                })))
        ]);

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                totalCount += result.value.length;
                allUpcoming = [...allUpcoming, ...result.value];
            }
        });

        // Sort by start time and take top 3
        const topContests = allUpcoming
            .sort((a, b) => a.startTime - b.startTime)
            .slice(0, 3);

        res.json({ totalCount, topContests });
    } catch (error) {
        console.error('Contest Summary Error:', error);
        res.status(500).json({ totalCount: 0, topContests: [], error: error.message });
    }
});

router.get('/', (req, res) => {
    res.redirect('/api/contests/upcoming-summary');
});

module.exports = router;

