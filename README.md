# MCP (Multi-Component Prompting)

<div align="center">

![MCP Logo](https://img.shields.io/badge/MCP-Multi--Component%20Prompting-6366F1?style=for-the-badge)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Compatible-orange.svg)](https://ollama.ai/)

A modern, elegant interface for interacting with local LLMs to assist with various coding tasks.

</div>

## 🌟 Overview

MCP is a powerful Node.js application that provides a sleek interface for interacting with locally-running Large Language Models (LLMs) via Ollama. It specializes in handling various coding tasks like writing, debugging, explaining, refactoring, testing, and converting code, all through a clean and intuitive UI.

<div align="center">
<i>💡 Note: Add a screenshot of your UI here when publishing to GitHub</i>
</div>

## ✨ Features

- **🧩 Specialized Task Types**: Support for various coding tasks with optimized prompts
- **🌐 Code Conversion**: Translate code between different programming languages
- **🏠 Local LLM Integration**: Uses your locally running models via Ollama for privacy and control
- **🎨 Modern UI**: Clean, responsive interface with a subtle gradient design
- **🌓 Dark/Light Mode**: Toggle between light and dark themes with persistent preference
- **📜 Prompt History**: Keeps track of your recent prompts with local storage persistence
- **🧹 Clean Responses**: Automatically removes thinking/reasoning sections for concise outputs
- **📋 Copy Functionality**: One-click copying of code responses to clipboard
- **🛡️ Robust Error Handling**: Detailed feedback and error recovery
- **📱 Responsive Design**: Works on desktop and mobile devices
- **📚 Setup Guide**: Detailed instructions for setting up your own local LLM with Ollama

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **LLM Engine**: Compatible with any Ollama model (tested with Deepseek, Llama, Mistral)
- **Frontend**: HTML, CSS, JavaScript (no external frameworks)
- **API Communication**: REST API

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Ollama](https://ollama.ai/) with at least one model installed

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mcp.git
cd mcp
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure the model (optional)**

By default, MCP uses the `deepseek-r1:14b` model. If you want to use a different model, edit the `OLLAMA_API` constant in `server.js`:

```javascript
// Find this line in server.js
const response = await axios.post(OLLAMA_API, {
    model: 'deepseek-r1:14b', // Change to your preferred model
    prompt,
    stream: false
});
```

## 💻 Usage

1. **Start Ollama with your preferred model**

```bash
ollama run deepseek-r1:14b  # or your model of choice
```

2. **Start the MCP server**

```bash
npm start
```

3. **Access the web interface**

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

4. **For development with auto-restart**

```bash
npm run dev
```

## 🔍 How to Use

1. **Select a task type** from the dropdown menu
2. **Enter your code** (if applicable for the selected task)
3. **Write your instruction** in the instruction field
4. **Click "Ask Agent"** to get a response
5. **View your prompt history** at the bottom of the page

### Code Translation

To convert code between programming languages:
1. Select "Convert Code" from the task dropdown
2. Paste the source code in the code snippet area
3. Specify the target language in your instruction (e.g., "Convert this to Python")
4. Click "Ask Agent" to get the converted code
5. Use the copy button to easily copy the result to your clipboard

### Setting Up Your Local LLM

MCP provides an easy way to set up your own local LLM:

1. Click the "Use Your Local LLM" button at the bottom of the interface
2. Follow the step-by-step guide to:
   - Install Ollama
   - Pull a compatible model (deepseek-r1:14b recommended)
   - Run the model locally
   - Connect MCP to your local instance

This gives you complete privacy and control over the AI model being used.

### Dark Mode

Toggle between light and dark modes using the theme switch in the top-right corner. Your preference will be saved for future visits.

## 📝 API Endpoints

MCP provides the following API endpoints for integration with other tools:

- **POST /ask**: Send prompts to the LLM
  ```json
  {
    "taskType": "write|debug|explain|refactor|test|convert|default",
    "codeSnippet": "Your code here (if applicable)",
    "instruction": "Your instruction here"
  }
  ```

- **GET /tasks**: Get available task types
  ```json
  {
    "tasks": [
      { "id": "write", "name": "Write Code" },
      { "id": "debug", "name": "Debug Code" },
      ...
    ]
  }
  ```

- **GET /health**: Check server health
  ```json
  { 
    "status": "ok", 
    "message": "MCP Agent is running" 
  }
  ```

## 📚 Task Types

MCP supports the following specialized task types:

| Task Type | Description | Requires Code Snippet |
|-----------|-------------|:---------------------:|
| Write Code | Generate code based on a description | ❌ |
| Debug Code | Find and fix issues in code | ✅ |
| Explain Code | Get detailed explanations of code | ✅ |
| Refactor Code | Improve existing code | ✅ |
| Write Tests | Generate unit tests for code | ✅ |
| Convert Code | Translate code between programming languages | ✅ |
| Custom Instruction | Free-form prompting | ❌ |

## 🔧 Troubleshooting

### Common Issues

1. **"Failed to communicate with the server"**
   - Ensure Ollama is running with your chosen model
   - Check that the Ollama API is accessible at http://localhost:11434

2. **"No response from LLM API"**
   - Verify that you have enough system resources to run the LLM
   - Try using a smaller model if you're experiencing memory issues

3. **Slow responses**
   - LLM response times depend on your hardware capabilities
   - Consider using a smaller/faster model for quicker responses

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## 📈 Roadmap

- [ ] Streaming responses for real-time feedback
- [ ] User authentication and multiple user support
- [ ] Saving responses to a database
- [ ] Support for additional LLM providers
- [ ] Advanced prompt templates and customization
- [ ] Code syntax highlighting in responses

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Ollama](https://ollama.ai/) for making local LLMs accessible
- [Express.js](https://expressjs.com/) for the web framework
- All contributors who have helped shape this project

---

<div align="center">
Made with ❤️ by Soham
</div>
