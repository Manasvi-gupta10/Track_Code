const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true
    },
    fullName: String,
    username: {
        type: String,
        unique: true,
        sparse: true // Allow null/undefined to not clash
    },
    bio: String,
    college: String,
    graduationYear: String,
    skills: String, // Storing as comma separated string as per frontend
    github: String,
    linkedin: String,
    codeforces: String,
    leetcode: String,
    codechef: String,
    hackerrank: String,
    geeksforgeeks: String,
    atcoder: String,
    profileImage: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
ProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Profile', ProfileSchema);
