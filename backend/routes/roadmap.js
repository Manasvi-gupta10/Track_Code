const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Roadmap = require('../models/Roadmap');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper to reliably parse JSON from Groq's output
const extractJSON = (content) => {
    try {
        // Try direct parsing first
        return JSON.parse(content);
    } catch (e) {
        // Fallback: Use regex to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
        }
        // Fallback 2: Find first { and last }
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
            return JSON.parse(content.substring(startIdx, endIdx + 1));
        }
        throw new Error('Could not parse JSON from AI response');
    }
};

// @route   POST /api/roadmap/generate
// @desc    Generate a personalized learning roadmap using Groq
// @access  Public
router.post('/generate', async (req, res) => {
    const { goal, currentSkills, dailyTime, deadline, learningStyle, techStack, focusAreas } = req.body;

    if (!goal || !currentSkills || !dailyTime || !deadline) {
        return res.status(400).json({ msg: 'Please provide goal, currentSkills, dailyTime, and deadline' });
    }

    try {
        const prompt = `You are an expert technical mentor and career coach. 
        Create a detailed, realistic learning roadmap for a student.
        Goal: ${goal}
        Current Skills: ${currentSkills}
        Daily Time Available: ${dailyTime}
        Target Deadline: ${deadline}
        Preferred Learning Style: ${learningStyle || 'Any'}
        Target Tech Stack: ${techStack || 'Standard recommended stack'}
        Core Weaknesses / Focus Areas: ${focusAreas || 'General coverage'}
        
        Generate a structured plan and return it strictly in the following JSON format:
        {
            "dailySchedule": "A paragraph describing how they should structure their daily study session.",
            "weeklyMilestones": [
                {
                    "title": "Week 1",
                    "focus": "Main theme for the week",
                    "tasks": ["Task 1", "Task 2", "Task 3"]
                }
            ],
            "resources": ["Resource 1", "Resource 2"],
            "projects": [
                {
                    "title": "Project Name",
                    "description": "Brief description of the project"
                }
            ],
            "aiFeedback": "A short encouraging note or warning about potential bottlenecks based on their deadline and current skills."
        }
        
        CRITICAL INSTRUCTION: Calculate the total duration from the "Target Deadline" (${deadline}) and generate exactly the right number of weeks in "weeklyMilestones" to fill that entire duration. For example, if the deadline is 6 months, generate ~24 weeks. If it is 1 year, generate 52 weeks. If it is 2 weeks, generate 2 weeks. Do not artificially limit the roadmap. Keep tasks highly actionable.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI mentor that returns learning roadmaps strictly in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const responseContent = chatCompletion.choices[0].message.content;
        const roadmapData = extractJSON(responseContent);

        res.json(roadmapData);
    } catch (err) {
        console.error('Groq Generate Roadmap Error:', err.message);
        res.status(500).json({
            error: 'Server Error while generating roadmap',
            details: err.message
        });
    }
});

// @route   POST /api/roadmap/adjust
// @desc    Dynamically adjust the roadmap based on performance
// @access  Public
router.post('/adjust', async (req, res) => {
    const { originalGoal, completedTaskCount, missedTaskCount, currentRoadmap } = req.body;

    if (!currentRoadmap) {
        return res.status(400).json({ msg: 'Current roadmap data is required' });
    }

    try {
        const prompt = `You are an expert technical mentor. 
        A student is following a roadmap for the goal: "${originalGoal}".
        So far, they have completed ${completedTaskCount} tasks and missed ${missedTaskCount} tasks.
        
        Here is their current roadmap structure:
        ${JSON.stringify(currentRoadmap)}
        
        They need an adjustment. If they have missed many tasks, scale back the difficulty or stretch the timeline slightly by redistributing tasks. If they completed everything, maybe introduce a slight challenge.
        
        Return the adjusted roadmap strictly in the exact same JSON format:
        {
            "dailySchedule": "...",
            "weeklyMilestones": [...],
            "resources": [...],
            "projects": [...],
            "aiFeedback": "A message explaining why the roadmap was adjusted and how they should proceed."
        }
        Ensure the output is valid JSON.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI mentor that adjusts learning roadmaps strictly in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const responseContent = chatCompletion.choices[0].message.content;
        const roadmapData = extractJSON(responseContent);

        res.json(roadmapData);
    } catch (err) {
        console.error('Groq Adjust Roadmap Error:', err.message);
        res.status(500).json({
            error: 'Server Error while adjusting roadmap',
            details: err.message
        });
    }
});

// @route   POST /api/roadmap/save
// @desc    Save a newly generated roadmap to DB
// @access  Public
router.post('/save', async (req, res) => {
    try {
        const { userId, name, goal, currentSkills, dailyTime, deadline, learningStyle, techStack, focusAreas, roadmapData, targetEndDate } = req.body;

        if (!userId || !name || !roadmapData) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        const newRoadmap = new Roadmap({
            userId,
            name,
            goal,
            currentSkills,
            dailyTime,
            deadline,
            learningStyle,
            techStack,
            focusAreas,
            roadmapData,
            targetEndDate: targetEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days if parse fails
        });

        const savedRoadmap = await newRoadmap.save();
        res.json(savedRoadmap);
    } catch (err) {
        console.error('Save Roadmap Error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/roadmap/:userId
// @desc    Get all active roadmaps for a user
// @access  Public
router.get('/:userId', async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        
        // Filter out expired roadmaps (where targetEndDate < now)
        const now = new Date();
        const activeRoadmaps = roadmaps.filter(r => !r.targetEndDate || new Date(r.targetEndDate) > now);

        res.json(activeRoadmaps);
    } catch (err) {
        console.error('Fetch Roadmaps Error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/roadmap/:id
// @desc    Update completed tasks for a roadmap
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const { completedTasks, roadmapData } = req.body;
        
        const updateFields = {};
        if (completedTasks) updateFields.completedTasks = completedTasks;
        if (roadmapData) updateFields.roadmapData = roadmapData;

        const roadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );

        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found' });
        
        res.json(roadmap);
    } catch (err) {
        console.error('Update Roadmap Error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
