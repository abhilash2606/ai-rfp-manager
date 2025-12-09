const OpenAI = require('openai');
const config = require('../config');

// Initialize OpenAI safely
const apiKey = config.openai.apiKey || process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey,
});

const parseNaturalLanguage = async (text) => {
    try {
        console.log("AI Service: generating RFP...");
        
        // Basic check if key exists
        if (!apiKey) {
            throw new Error("Missing OpenAI API Key");
        }

        const prompt = `
        Create a JSON object for an RFP based on this text: "${text}"
        
        Required JSON structure:
        {
            "title": "String",
            "description": "String",
            "budget": "50000" (String, numbers only),
            "timeline": "String",
            "requirements": [
                { "category": "General", "description": "String", "priority": "Medium" }
            ]
        }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a JSON generator." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        let content = response.choices[0].message.content.trim();
        // Clean up markdown if present
        content = content.replace(/^```json\n|\n```$/g, '');
        
        return JSON.parse(content);

    } catch (error) {
        console.error('AI Service Error:', error.message);
        
        // 🛡️ FALLBACK: Return dummy data instead of crashing the server
        return {
            title: "RFP: " + text.substring(0, 20) + "...",
            description: text,
            budget: "0",
            timeline: "TBD",
            requirements: [
                { 
                    category: "General", 
                    description: "Details to be defined based on description.", 
                    priority: "Medium" 
                }
            ]
        };
    }
};

const analyzeProposal = async (proposalText, rfpRequirements) => {
    return { score: 0, summary: "Manual review required", strengths: [], weaknesses: [] };
};

module.exports = { parseNaturalLanguage, analyzeProposal };