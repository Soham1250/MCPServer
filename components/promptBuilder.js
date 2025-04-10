/**
 * Prompt builder for MCP Server
 * Handles different task types and constructs appropriate prompts for the LLM
 */

/**
 * Build a prompt based on task type and user input
 * @param {string} taskType - Type of task (write, debug, explain, etc.)
 * @param {string} codeSnippet - Code snippet provided by the user
 * @param {string} instruction - User instruction
 * @returns {string} - Formatted prompt for the LLM
 */
function buildPrompt(taskType, codeSnippet, instruction) {
    // Base system prompt that defines the agent's capabilities
    const systemPrompt = `You are an expert software developer assistant. 
Respond concisely and accurately with well-formatted code.
DO NOT include any <think> tags or thinking process in your response.
ONLY provide the requested output in a clean format.`;

    // Extract programming language from instruction if present
    let language = 'JavaScript'; // Default language
    const languageMatch = instruction.match(/\b(JavaScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|PHP|TypeScript|Swift)\b/i);
    if (languageMatch) {
        language = languageMatch[0];
    }

    // Task-specific prompts
    switch (taskType) {
        case 'write':
            return `${systemPrompt}

Write a ${instruction} in ${language}.
Only provide the code without explanations.
Include proper error handling and comments.
Format your response as a code block with the appropriate language tag.`;

        case 'debug':
            return `${systemPrompt}

Debug the following code and explain what's wrong:

\`\`\`
${codeSnippet}
\`\`\`

Identify the issues, explain them briefly, and provide the corrected code.
Format your response with markdown code blocks.`;

        case 'explain':
            return `${systemPrompt}

Explain what this code does in detail:

\`\`\`
${codeSnippet}
\`\`\`

Break down the explanation by sections and describe the purpose of key components.`;

        case 'refactor':
            return `${systemPrompt}

Refactor the following code to make it more efficient and readable:

\`\`\`
${codeSnippet}
\`\`\`

Provide the refactored code with brief comments explaining the improvements.
Format your response with markdown code blocks.`;

        case 'test':
            return `${systemPrompt}

Write unit tests for the following code:

\`\`\`
${codeSnippet}
\`\`\`

Use a standard testing framework and cover the main functionality.
Format your response with markdown code blocks.`;

        case 'convert':
            // Extract target language from instruction
            let targetLanguage = 'Python'; // Default target language
            const targetMatch = instruction.match(/\bto\s+(JavaScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|PHP|TypeScript|Swift)\b/i);
            if (targetMatch) {
                targetLanguage = targetMatch[1];
            }
            
            return `${systemPrompt}

Convert the following code to ${targetLanguage}:

\`\`\`
${codeSnippet}
\`\`\`

Provide only the converted code with necessary comments.
Ensure the converted code maintains the same functionality.
Format your response with a markdown code block with the appropriate language tag.`;

        default:
            return `${systemPrompt}

${instruction}

If your response includes code, format it with markdown code blocks.`;
    }
}

module.exports = {
    buildPrompt
};
