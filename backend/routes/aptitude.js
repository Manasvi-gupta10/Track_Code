const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// @route   POST /api/aptitude/generate-questions
// @desc    Generate aptitude MCQs based on domain
// @access  Public
router.post('/generate-questions', async (req, res) => {
    const { domain, difficulty, count } = req.body;

    try {
        const prompt = `Generate ${count} high-quality Multiple Choice Questions (MCQs) for the Aptitude domain: ${domain}.
        
        Domain Guidelines:
        - Quantitative Mastery: Focus on Arithmetic, Algebra, Geometry, Number Systems, P&C, Probability.
        - Logical Inference: Focus on Series, Syllogisms, Blood Relations, Coding-Decoding, Seating Arrangements.
        - Verbal Proficiency: Focus on Synonyms, Antonyms, Sentence Correction, Idioms, Verbal Analogies.
        - Data Analytics: Focus on Tables, Bar Charts, Pie Charts, Line Graphs (describe the data clearly in the question text).

        Difficulty: ${difficulty} (Adjust complexity of calculations or reasoning depth accordingly).
        
        Requirements:
        1. Each question must have exactly 4 options.
        2. Provide the index of the correct answer (0-3).
        3. For Quantitative/Data Analytics, provide a short explanation for the solution in an "explanation" field.
        4. Return the result as a JSON object with a key "questions" containing an array of objects.
        
        Question Object Structure:
        {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correct": number,
            "explanation": "string"
        }`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert Aptitude test creator specializing in competitive exam preparation."
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
        res.json(data);
    } catch (err) {
        console.error('Groq Aptitude Error:', err.message);
        res.status(500).json({ error: 'Failed to generate aptitude questions', details: err.message });
    }
});

module.exports = router;
