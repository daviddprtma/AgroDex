const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// AI Chat API endpoint
app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
        return res.status(400).json({ error: 'Message and sessionId are required' });
    }

    try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
        });

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        res.json({ 
            response: response.content[0].text,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

app.listen(port, () => {
    console.log(`AgroDex server running at http://localhost:${port}`);
});