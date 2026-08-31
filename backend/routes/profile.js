const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Public (for now, should be protected)
router.post('/', async (req, res) => {
    console.log('Received profile data:', req.body);
    console.log('ProfileImage field:', req.body.profileImage);
    
    const {
        firebaseUid,
        email,
        fullName,
        username,
        bio,
        college,
        graduationYear,
        skills,
        github,
        linkedin,
        codeforces,
        leetcode,
        codechef,
        hackerrank,
        geeksforgeeks,
        atcoder,
        profileImage
    } = req.body;

    // Build profile object
    const profileFields = {
        firebaseUid,
        email,
        fullName,
        username,
        bio,
        college,
        graduationYear,
        skills,
        github,
        linkedin,
        codeforces,
        leetcode,
        codechef,
        hackerrank,
        geeksforgeeks,
        atcoder,
        profileImage
    };

    console.log('Profile fields to save:', profileFields);

    try {
        // Check if profile exists
        // Using findOneAndUpdate with upsert option
        // new: true returns the document after update
        // upsert: true creates the object if it doesn't exist
        // setDefaultsOnInsert: true ensures default values are applied on creation
        let profile = await Profile.findOneAndUpdate(
            { firebaseUid: firebaseUid },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/profile/:uid
// @desc    Get profile by firebase uid
// @access  Public
router.get('/:uid', async (req, res) => {
    try {
        const profile = await Profile.findOne({ firebaseUid: req.params.uid });

        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
