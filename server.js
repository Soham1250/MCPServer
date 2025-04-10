const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_API = 'http://localhost:11434/api/generate';

// Middleware
app.use(cors()); // Allow all origins
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import prompt builder
const { buildPrompt } = require('./components/promptBuilder');

/**
 * Clean up LLM response by removing thinking tags and formatting properly
 * @param {string} response - Raw response from LLM
 * @returns {string} - Cleaned response
 */
function cleanResponse(response) {
    if (!response) return '';
    
    // Remove thinking tags and their content (including any variations)
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/g, '');
    cleaned = cleaned.replace(/\[thinking\][\s\S]*?\[\/thinking\]/g, '');
    cleaned = cleaned.replace(/thinking:[\s\S]*?(response:|answer:)/gi, '$1');
    
    // Remove any remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // Remove "Response:" or "Answer:" prefixes
    cleaned = cleaned.replace(/^(response:|answer:)\s*/i, '');
    
    // Normalize multiple newlines to maximum of two
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    // If cleaning resulted in empty response, provide a helpful message
    if (!cleaned) {
        return "The AI provided a response, but it was empty after cleaning. Please try again with a different prompt.";
    }
    
    return cleaned;
}

// API endpoints
app.post('/ask', async (req, res) => {
    try {
        const { taskType, codeSnippet, instruction } = req.body;
        
        if (!instruction) {
            return res.status(400).json({ error: 'Instruction is required' });
        }
        
        // Build prompt based on task type
        const prompt = buildPrompt(taskType, codeSnippet, instruction);
        
        console.log(`Sending prompt to LLM for task type: ${taskType}`);
        
        // Check if Ollama is accessible before making the request
        try {
            await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
        } catch (connectionError) {
            console.error('Ollama connection check failed:', connectionError.message);
            return res.status(503).json({ 
                error: 'Could not connect to Ollama. Make sure Ollama is running on your machine.',
                details: 'Run "ollama serve" in your terminal to start Ollama.'
            });
        }
        
        console.log('Ollama connection check passed, sending request...');
        
        // Send to Ollama with timeout
        const response = await axios.post(OLLAMA_API, {
            model: 'deepseek-r1:14b',
            prompt,
            stream: false
        }, { 
            timeout: 30000  // 30 second timeout
        });
        
        if (!response.data || !response.data.response) {
            console.error('Empty response from Ollama:', response.data);
            return res.status(500).json({ error: 'No response from LLM API' });
        }
        
        // Clean the response to remove thinking sections
        const cleanedResponse = cleanResponse(response.data.response);
        
        // Log response length for debugging
        console.log(`Response received. Length: ${response.data.response.length} chars`);
        console.log(`Cleaned response. Length: ${cleanedResponse.length} chars`);
        
        return res.json({ response: cleanedResponse });
    } catch (error) {
        console.error('Error in /ask endpoint:', error.message);
        
        // Log the full error for debugging
        console.error('Full error object:', error);
        
        // Provide more specific error messages
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: 'Could not connect to Ollama. Make sure Ollama is running on your machine.',
                details: 'Run "ollama serve" in your terminal to start Ollama.'
            });
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
            return res.status(504).json({ 
                error: 'Connection to Ollama timed out',
                details: 'The request took too long to complete. Check if Ollama is running properly.'
            });
        } else if (error.response && error.response.status === 404) {
            return res.status(404).json({ 
                error: 'Model not found in Ollama',
                details: 'Run "ollama pull deepseek-r1:14b" to download the model.'
            });
        } else if (error.response && error.response.status === 400) {
            return res.status(400).json({ 
                error: 'Bad request to Ollama API',
                details: error.response.data?.error || 'Check your prompt and model configuration.'
            });
        } else {
            return res.status(500).json({ 
                error: 'Failed to communicate with the server',
                details: error.message || 'Unknown error occurred'
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
            { id: 'convert', name: 'Convert Code' },
            { id: 'default', name: 'Custom Instruction' }
        ]
    });
});

// Check if Ollama is running
async function checkOllamaStatus() {
    try {
        await axios.get('http://localhost:11434/api/tags');
        console.log(' Ollama is running and accessible');
        return true;
    } catch (error) {
        console.error(' Ollama is not running or not accessible');
        console.log(' To start Ollama, run "ollama serve" in your terminal');
        return false;
    }
}

// Check if the model is available
async function checkModelAvailability(model) {
    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        
        // Ollama API returns a list of models in the 'models' array
        const models = response.data.models || [];
        
        // Check if our model exists in the list
        const modelExists = models.some(m => 
            // The model name might be in the format 'name:tag'
            m.name === model || m.name.split(':')[0] === model
        );
        
        if (modelExists) {
            console.log(` Model '${model}' is available`);
            return true;
        } else {
            console.log(` Model '${model}' is not available`);
            console.log(` To download the model, run "ollama pull ${model}"`);
            return false;
        }
    } catch (error) {
        console.error(' Could not check model availability');
        return false;
    }
}

// Start server
app.listen(PORT, async () => {
    console.log(`\n MCP Agent running at http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Available tasks: http://localhost:${PORT}/tasks\n`);
    
    // Check Ollama status
    const ollamaRunning = await checkOllamaStatus();
    if (ollamaRunning) {
        await checkModelAvailability('deepseek-r1:14b');
    }
    
    console.log('\n Usage Instructions:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Select a task type and enter your prompt');
    console.log('3. Click "Ask Agent" to get a response\n');
});
