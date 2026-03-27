# Omni Claw 🔮

> **Your own AI supercomputer. Any channel. Any model. Any task.**

Omni Claw is a self-hosted AI platform that combines the power of a personal AI assistant with deep research capabilities. Chat from any platform — WhatsApp, Telegram, Discord, and more — and get intelligent responses with real-time web research, multi-model support, and autonomous task execution.

## What Makes Omni Claw Different?

| Feature | OpenClaw | Perplexity | **Omni Claw** |
|---------|----------|------------|---------------|
| Chat Channels (20+) | ✅ | ❌ | ✅ |
| Deep Research with Citations | ❌ | ✅ | ✅ |
| Browser Control | ✅ | ❌ | ✅ |
| Terminal/Shell | ✅ | ❌ | ✅ |
| Multi-Model Gateway (12+) | ❌ | ✅ | ✅ |
| Voice (Wake + Talk) | ✅ | ❌ | ✅ |
| Canvas/A2UI | ✅ | ❌ | ✅ |
| Mobile Nodes | ✅ | ❌ | ✅ |
| Advanced Search Filters | ❌ | ✅ | ✅ |
| Chain of Thought Reasoning | ❌ | ✅ | ✅ |
| File/Document Analysis | ❌ | ✅ | ✅ |
| Cron/Automation | ✅ | ❌ | ✅ |
| Memory System | ✅ | ❌ | ✅ |
| Skills Platform | ✅ | ❌ | ✅ |
| Deploy Engine | ❌ | ❌ | ✅ |
| Self-Hosted | ✅ | ❌ | ✅ |

## Quick Start

```bash
# Install
npm install -g omniclaw

# Setup
omniclaw setup

# Add your API keys
omniclaw config set PERPLEXITY_API_KEY=your-key
omniclaw config set OPENAI_API_KEY=your-key  # optional

# Start
omniclaw gateway start

# Chat
omniclaw chat "Research karo quantum computing ke latest advances"
```

## Features

### 🔮 Deep Research Engine
- Powered by Perplexity Sonar Deep Research
- Multi-step autonomous research
- Citation tracking with source URLs
- Domain filtering (arxiv.org, nature.com, etc.)
- Academic paper search
- SEC filings research
- Comprehensive reports

### 🔍 Advanced Search
- Web search with filters
- Recency filtering (day/week/month/year)
- Academic source filtering
- Language preference
- Image and video results
- Raw search results (Search API)

### 🧠 Reasoning Engine
- Chain of thought reasoning
- Step-by-step analysis
- Multi-factor comparisons
- Decision support
- Pro/Con analysis

### 🤖 Multi-Model Gateway
- 12+ models with one API key
- OpenAI (GPT-5.x)
- Anthropic (Claude 4.x)
- Google (Gemini 3.x)
- xAI (Grok 4.x)
- NVIDIA (Nemotron)
- Model fallback chains
- Cost optimization

### 📱 Multi-Channel Support
- WhatsApp
- Telegram
- Discord
- Slack
- Signal
- iMessage
- Google Chat
- IRC
- Microsoft Teams
- Matrix
- LINE
- Mattermost
- And more...

### 🌐 Browser Control
- Automated Chromium browser
- Click, type, navigate, screenshot
- Multi-profile support
- SSRF protection

### 💻 Terminal Access
- Full shell command execution
- Background processes
- File system operations

### 🎙️ Voice
- Wake word activation
- Talk mode
- Text-to-speech

### 🎨 Canvas
- Visual workspace (A2UI)
- Live rendering
- Interactive UIs

### 📲 Mobile Nodes
- iOS + Android
- Camera, screen, location
- Notifications

### ⏰ Automation
- Cron jobs
- Heartbeat scheduling
- Webhooks

### 🧠 Memory
- Semantic memory search
- Session transcripts
- Long-term memory

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 OMNI CLAW                        │
├─────────────────────────────────────────────────┤
│                                                  │
│  📱 Channels (20+)                               │
│  WhatsApp, Telegram, Discord, Slack, Signal...   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │            Gateway (Control Plane)         │  │
│  │         ws://127.0.0.1:PORT                │  │
│  └────────────────┬───────────────────────────┘  │
│                   │                              │
│    ┌──────────────┼──────────────┐               │
│    │              │              │               │
│    ▼              ▼              ▼               │
│  ┌──────┐  ┌───────────┐  ┌──────────┐          │
│  │Agent │  │  Research  │  │  Tools   │          │
│  │Engine│  │  Engine    │  │ Engine   │          │
│  └──┬───┘  └─────┬─────┘  └────┬─────┘          │
│     │            │              │                │
│     │     ┌──────┴──────┐      │                │
│     │     │             │      │                │
│     │     ▼             ▼      ▼                │
│     │  Perplexity   Browser  Terminal           │
│     │  API          Control  + Files            │
│     │                                          │
│     ▼                                          │
│  ┌──────────┐  ┌──────┐  ┌───────┐             │
│  │  Voice   │  │Canvas│  │Mobile │             │
│  │  + TTS   │  │ A2UI │  │ Nodes │             │
│  └──────────┘  └──────┘  └───────┘             │
│                                                  │
└─────────────────────────────────────────────────┘
```

## API Keys (User's Own)

Omni Claw uses your own API keys — zero cost to us:

| Key | Purpose | Where to Get |
|-----|---------|--------------|
| `PERPLEXITY_API_KEY` | Deep research + search | [console.perplexity.ai](https://console.perplexity.ai) |
| `OPENAI_API_KEY` | GPT models | [platform.openai.com](https://platform.openai.com) |
| `ANTHROPIC_API_KEY` | Claude models | [console.anthropic.com](https://console.anthropic.com) |
| `GEMINI_API_KEY` | Gemini models | [ai.google.dev](https://ai.google.dev) |
| `NVIDIA_API_KEY` | Nemotron models | [build.nvidia.com](https://build.nvidia.com) |
| `BRAVE_API_KEY` | Web search | [brave.com/search/api](https://brave.com/search/api/) |

## Pricing

Omni Claw itself is **free and open source**. You only pay for API usage:

- Perplexity: $0.006 - $1.32/query (depends on depth)
- AI Models: Direct provider pricing (no markup)
- Search: $5/1000 requests

## License

MIT
