# Thor.dev AI Services Setup

Thor.dev uses multiple AI services to provide intelligent code generation, analysis, and assistance. This guide will help you set up the best free and open-source AI services to compete with Cursor, Bolt, and Lovable.

## 🦙 Ollama (Recommended - Local & Free)

Ollama runs AI models locally on your machine, providing privacy, speed, and zero cost.

### Installation

#### macOS
```bash
# Install via Homebrew
brew install ollama

# Or download from https://ollama.ai
```

#### Linux
```bash
# Install via curl
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download from [ollama.ai](https://ollama.ai) and run the installer.

### Setup for Thor.dev

1. **Start Ollama server:**
   ```bash
   ollama serve
   ```

2. **Install recommended models:**
   ```bash
   # Code generation (7B model - good balance of speed/quality)
   ollama pull codellama:7b
   
   # For better code quality (larger model)
   ollama pull codellama:13b
   
   # General purpose model
   ollama pull llama2:7b
   
   # Lightweight option for lower-end hardware
   ollama pull codellama:base
   ```

3. **Configure Thor.dev:**
   ```bash
   # In your .env.local file
   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="codellama:7b"
   ```

4. **Test the connection:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Model Recommendations

| Model | Size | Use Case | Performance |
|-------|------|----------|-------------|
| `codellama:base` | 3.8GB | Basic code completion | Fast |
| `codellama:7b` | 3.8GB | Balanced code generation | **Recommended** |
| `codellama:13b` | 7.3GB | High-quality code | Slower but better |
| `codellama:34b` | 19GB | Production-grade code | Requires powerful hardware |

## 🤗 Hugging Face (Free Tier)

Hugging Face provides free inference API for many models.

### Setup

1. **Create account:** Visit [huggingface.co](https://huggingface.co)

2. **Get API key:** Go to Settings → Access Tokens → New Token

3. **Configure Thor.dev:**
   ```bash
   # In your .env.local file
   HUGGINGFACE_API_KEY="hf_your_token_here"
   ```

### Recommended Models

- `microsoft/DialoGPT-medium` - Conversational AI
- `microsoft/CodeBERT-base` - Code understanding
- `Salesforce/codegen-350M-mono` - Code generation

## 🌊 Cohere (Free Tier)

Cohere offers a generous free tier for AI language models.

### Setup

1. **Create account:** Visit [cohere.ai](https://cohere.ai)

2. **Get API key:** Dashboard → API Keys

3. **Configure Thor.dev:**
   ```bash
   # In your .env.local file
   COHERE_API_KEY="your_cohere_api_key"
   ```

## 🔄 Service Priority

Thor.dev automatically selects the best available AI service:

1. **Ollama** (Local, fastest, most private)
2. **Hugging Face** (Free tier)
3. **Cohere** (Free tier)
4. **OpenAI/Anthropic** (If API keys provided)
5. **Enhanced Templates** (Fallback)

## 🚀 Performance Optimization

### Ollama Performance Tips

1. **Use GPU acceleration:**
   ```bash
   # Check if GPU is available
   ollama list
   
   # For NVIDIA GPUs, ensure CUDA is installed
   # For Apple Silicon, GPU acceleration is automatic
   ```

2. **Optimize model selection:**
   - Development: `codellama:7b`
   - Production: `codellama:13b`
   - Low memory: `codellama:base`

3. **Keep models loaded:**
   ```bash
   # Preload model to avoid startup delay
   ollama run codellama:7b
   ```

### System Requirements

| Model Size | RAM Required | GPU VRAM | Performance |
|------------|--------------|----------|-------------|
| 7B | 8GB | 4GB | Good |
| 13B | 16GB | 8GB | Better |
| 34B | 32GB | 16GB | Best |

## 🔧 Troubleshooting

### Ollama Issues

**Connection refused:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
ollama serve
```

**Model not found:**
```bash
# List installed models
ollama list

# Pull missing model
ollama pull codellama:7b
```

**Out of memory:**
```bash
# Use smaller model
ollama pull codellama:base

# Or increase swap space (Linux)
sudo swapon --show
```

### API Issues

**Rate limits exceeded:**
- Ollama: No limits (local)
- Hugging Face: 1000 requests/month (free)
- Cohere: 100 API calls/minute (free)

**API key invalid:**
- Regenerate API key
- Check environment variables
- Restart development server

## 📊 Comparing AI Services

| Service | Cost | Privacy | Speed | Quality | Limits |
|---------|------|---------|--------|---------|---------|
| Ollama | Free | 100% Private | Fast* | Good | None |
| Hugging Face | Free tier | Shared | Medium | Good | 1k/month |
| Cohere | Free tier | Shared | Fast | Good | 100/min |
| OpenAI | Paid | Shared | Fast | Excellent | Pay-per-use |

*Speed depends on local hardware

## 🎯 Best Practices

### For Development
1. Use Ollama with `codellama:7b`
2. Keep Ollama server running
3. Fallback to Hugging Face for complex tasks

### For Production
1. Use `codellama:13b` or `codellama:34b`
2. Implement proper error handling
3. Monitor API usage and costs

### For Teams
1. Share Ollama server on local network
2. Use consistent model versions
3. Document model choices in README

## 🔮 Advanced Configuration

### Custom Ollama Models

```bash
# Create custom model with specific prompts
cat > Modelfile << EOF
FROM codellama:7b
SYSTEM "You are an expert TypeScript developer focused on Next.js applications."
EOF

ollama create thor-coder -f Modelfile
```

### Load Balancing

```javascript
// In ai-services.ts, add multiple Ollama instances
const ollamaInstances = [
  'http://localhost:11434',
  'http://192.168.1.100:11434', // Team member's machine
  'http://192.168.1.101:11434', // Another instance
]
```

### Model Switching

```bash
# Switch models based on task
OLLAMA_MODEL="codellama:7b"     # Code generation
OLLAMA_MODEL="llama2:7b"        # General chat
OLLAMA_MODEL="codellama:13b"    # Complex tasks
```

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Hugging Face Models](https://huggingface.co/models)
- [Cohere Documentation](https://docs.cohere.ai)
- [CodeLlama Paper](https://arxiv.org/abs/2308.12950)

## 🆘 Support

If you encounter issues:

1. Check the [Thor.dev GitHub Issues](https://github.com/your-repo/thor-dev/issues)
2. Join our [Discord Community](https://discord.gg/thor-dev)
3. Read the [Troubleshooting Guide](./Troubleshooting.md)

---

**Ready to compete with Cursor and Bolt?** 🚀

With Ollama running locally, Thor.dev provides:
- ⚡ Instant code generation
- 🔒 Complete privacy
- 💰 Zero API costs
- 🎯 Specialized coding models
- 🤖 Multi-agent collaboration