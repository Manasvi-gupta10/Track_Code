const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    goal: String,
    currentSkills: String,
    dailyTime: String,
    deadline: String,
    learningStyle: String,
    techStack: String,
    focusAreas: String,
    roadmapData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    completedTasks: {
        type: [String],
        default: []
    },
    targetEndDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
