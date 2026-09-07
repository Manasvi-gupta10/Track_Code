const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/resume/analyze
// @desc    Analyze resume against JD using Groq
// @access  Public
router.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription } = req.body;
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        // Parse PDF
        const dataBuffer = resumeFile.buffer;
        const pdfData = await pdf(dataBuffer);
        const resumeText = pdfData.text;

        const prompt = `
        You are an expert ATS (Applicant Tracking System) and professional recruiter.
        Analyze the following resume against the provided job description.
        
        Job Description:
        "${jobDescription}"
        
        Resume Content:
        "${resumeText}"
        
        Provide a comprehensive analysis in JSON format with the following keys:
        - "matchScore": A percentage (0-100) indicating compatibility.
        - "atsCompatibility": A score (0-100) for ATS-friendliness.
        - "keywordMatching": { "found": [], "missing": [] }.
        - "skillAnalysis": { "technical": [], "soft": [], "missing": [] }.
        - "projectQuality": "Brief evaluation of projects".
        - "strengths": [].
        - "weakAreas": [].
        - "recruiterInsights": "Strategic advice for the candidate".
        - "interviewProbability": "Percentage likelihood of being shortlisted (0-100)".
        - "suggestions": [].

        Return ONLY the JSON.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a professional career coach and ATS expert who returns detailed resume analysis in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(analysis);

    } catch (err) {
        console.error('Resume Analysis Error:', err);
        res.status(500).json({ error: 'Failed to analyze resume', details: err.message });
    }
});

module.exports = router;
