const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// @route   POST /api/interview/generate-stress-questions
// @desc    Generate stress interview questions using Groq
// @access  Public
router.post('/generate-stress-questions', async (req, res) => {
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ msg: 'Role is required' });
    }

    try {
        const prompt = `You are a strict and experienced interviewer conducting a STRESS INTERVIEW for the role of ${role}. 
        Generate 5 intense, challenging, and slightly provocative interview questions that test the candidate's pressure-handling, conflict resolution, and soft skills.
        The questions should be realistic but tough.
        Return the result as a JSON array of strings only.
        Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that returns interview questions in JSON format."
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
        const parsedResponse = JSON.parse(responseContent);

        // Handle different possible JSON structures from LLM
        let questions = [];
        if (Array.isArray(parsedResponse)) {
            questions = parsedResponse;
        } else if (parsedResponse.questions) {
            questions = parsedResponse.questions;
        } else {
            // Fallback for other keys
            const keys = Object.keys(parsedResponse);
            if (keys.length > 0 && Array.isArray(parsedResponse[keys[0]])) {
                questions = parsedResponse[keys[0]];
            }
        }

        res.json({ questions });
    } catch (err) {
        console.error('Groq Error:', err.message);
        res.status(500).json({
            error: 'Server Error while generating questions',
            details: err.message
        });
    }
});

// @route   POST /api/interview/evaluate-answer
// @desc    Evaluate user's interview answer using Groq
// @access  Public
router.post('/evaluate-answer', async (req, res) => {
    const { question, role, userAnswer } = req.body;

    if (!question || !userAnswer) {
        return res.status(400).json({ msg: 'Question and answer are required' });
    }

    try {
        const prompt = `You are a professional HR expert and technical interviewer. 
        Evaluate the following response to a STRESS INTERVIEW question for the role of ${role}.
        
        Question: "${question}"
        Candidate's Answer: "${userAnswer}"
        
        Provide a detailed evaluation in JSON format with the following keys:
        - "score": A score from 0-100 based on the quality and composure of the answer.
        - "strengths": A list of 2-3 things the candidate did well.
        - "weaknesses": A list of 2-3 areas for improvement.
        - "improvedAnswer": A professional, high-impact version of how this answer should have been delivered.
        - "overallFeedback": A brief summary of the performance.
        
        Return ONLY the JSON.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a professional interviewer providing constructive feedback in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const feedback = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(feedback);
    } catch (err) {
        console.error('Groq Evaluation Error:', err.message);
        res.status(500).json({ error: 'Failed to evaluate answer', details: err.message });
    }
});

// @route   POST /api/interview/generate-rapid-fire-questions
// @desc    Generate rapid-fire MCQs using Groq
// @access  Public
router.post('/generate-rapid-fire-questions', async (req, res) => {
    const { topic, difficulty, count } = req.body;

    let retries = 3;
    while (retries > 0) {
        try {
            const prompt = `Generate ${count} Multiple Choice Questions (MCQs) for a "Rapid Fire" interview round.
            Topic: ${topic}
            Requested Difficulty: ${difficulty}
            
            Difficulty Guidelines:
            1. If Difficulty is "Adaptive":
               - First 30% of questions should be EASY (Fundamentals).
               - Next 40% should be MEDIUM (Implementation).
               - Final 30% should be HARD (Internals/Architecture).
            2. Strict Level Definitions:
               - EASY: Basic definitions, acronyms, core syntax.
               - MEDIUM: Implementation details, complexity analysis, standard algorithms.
               - HARD: Advanced architectural patterns, deep internal workings, rare edge cases, complex optimizations.
            
            Requirements:
            1. Each question must have exactly 4 options.
            2. The questions should be concise and suitable for a 10-second timer.
            3. CRITICAL: You MUST return the result in EXACTLY the following JSON structure. Do NOT include any trailing commas, malformed quotes, or invalid JSON syntax.
            {
                "questions": [
                    {
                        "question": "What is...?",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "correct": 2
                    }
                ]
            }
            4. The "correct" key MUST be an integer between 0 and 3 representing the index of the correct option in the options array.`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a highly precise technical quiz generator. You ALWAYS output flawless, strictly valid JSON without syntax errors."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const data = JSON.parse(chatCompletion.choices[0].message.content);
            return res.json(data);
        } catch (err) {
            console.error(`Groq Quiz Error (Retries left: ${retries - 1}):`, err.message);
            retries--;
            if (retries === 0) {
                return res.status(500).json({ error: 'Failed to generate quiz after multiple attempts', details: err.message });
            }
        }
    }
});

// @route   POST /api/interview/generate-whiteboard-problem
// @desc    Generate a unique whiteboard interview problem using Groq
// @access  Public
router.post('/generate-whiteboard-problem', async (req, res) => {
    const { topic } = req.body;

    try {
        const prompt = `Generate a set of 3 unique and challenging WHITEBOARD interview problems for a software engineering role.
        Focus Topics: Trees, Graphs, and System Design.
        
        Requirements for each problem:
        1. Provide a clear Title.
        2. Provide a concise but detailed Problem Description.
        3. Provide an Example Case (MUST be a formatted string).
        4. Ensure the questions are high-quality and diverse.
        
        Return the result as a JSON object with a key "questions" containing an array of 3 objects, each with keys: "title", "content", "example".`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a technical interviewer providing unique whiteboard problem sets in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(chatCompletion.choices[0].message.content);
        console.log("AI Response Data:", JSON.stringify(data, null, 2));
        res.json(data);
    } catch (err) {
        console.error('Groq Whiteboard Error:', err);
        res.status(500).json({ error: 'Failed to generate problem', details: err.message });
    }
});

module.exports = router;
