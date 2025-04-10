const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;
const OLLAMA_API = 'http://localhost:11434/api/generate';

app.use(cors()); // ✅ Allow all origins
app.use(bodyParser.json());

function buildPrompt(taskType, codeSnippet, instruction) {
    switch (taskType) {
        case 'write':
            return `Write a ${instruction} function in JavaScript. Only provide the code without explanations.`;
        case 'debug':
            return `Debug the following code and explain what's wrong:\n\n${codeSnippet}`;
        case 'explain':
            return `Explain what this code does in detail:\n\n${codeSnippet}`;
        case 'refactor':
            return `Refactor the following code to make it more efficient and readable:\n\n${codeSnippet}`;
        case 'test':
            return `Write unit tests for the following code:\n\n${codeSnippet}`;
        default:
            return instruction;
    }
}

app.post('/ask', async (req, res) => {
    const { taskType = 'default', codeSnippet = '', instruction = '' } = req.body;
    
    if (!taskType && !instruction) {
        return res.status(400).json({ error: 'Missing required parameters: taskType or instruction' });
    }
    
    const prompt = buildPrompt(taskType, codeSnippet, instruction);
    console.log('🧾 Prompt:', prompt); // 🔍 Debug

    try {
        const response = await axios.post(OLLAMA_API, {
            model: 'deepseek-r1:14b',
            prompt,
            stream: false
        });

        // Check if the response has the expected structure
        if (response.data && response.data.response) {
            res.json({ response: response.data.response });
        } else {
            console.error('❌ Unexpected response format:', response.data);
            res.status(500).json({ 
                error: 'Unexpected response format from LLM',
                details: response.data
            });
        }
    } catch (error) {
        console.error('❌ Error from LLM:', error.message);
        
        // Provide more detailed error information
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            res.status(error.response.status).json({ 
                error: 'LLM API error',
                details: error.response.data || error.message
            });
        } else if (error.request) {
            console.error('No response received:', error.request);
            res.status(503).json({ 
                error: 'No response from LLM API',
                details: 'Check if Ollama is running at ' + OLLAMA_API
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to communicate with LLM',
                details: error.message
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MCP Agent is running' });
});

// Get available task types
app.get('/tasks', (req, res) => {
    res.json({
        tasks: [
            { id: 'write', name: 'Write Code' },
            { id: 'debug', name: 'Debug Code' },
            { id: 'explain', name: 'Explain Code' },
            { id: 'refactor', name: 'Refactor Code' },
            { id: 'test', name: 'Write Tests' },
            { id: 'default', name: 'Custom Instruction' }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🧠 MCP Agent running at http://localhost:${PORT}`);
    console.log(`💡 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Available tasks: http://localhost:${PORT}/tasks`);
});
