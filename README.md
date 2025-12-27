# 🧠 CF AI Flashcards

An AI-powered flashcard generator that creates educational flashcards on any topic using **Cloudflare Workers AI (Llama 3.3)**, **Durable Objects**, and **Pages**.

## ✨ What Does It Do?

Simply enter any topic (e.g., "Python Programming", "Ancient Rome", "Calculus") and the AI will instantly generate study flashcards with questions and answers. Click any card to flip and see the answer!

## 🎯 Features

- **AI-Generated Content**: Powered by Llama 3.3 70B model via Cloudflare Workers AI
- **Persistent Storage**: Your flashcards are saved using Durable Objects - reload anytime!
- **Interactive UI**: Click to flip cards, delete unwanted ones, generate new sets
- **100% Serverless**: Built entirely on Cloudflare's edge infrastructure

## 🌐 Live Demo

**Try it now**: [https://cf-ai-flashcards.pages.dev](https://cf-ai-flashcards.pages.dev)

*(Replace with your actual deployed URL)*

## 🏗️ Architecture

\`\`\`
┌─────────────────┐
│  Cloudflare     │
│  Pages (UI)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Worker API    │─────►│   Workers AI     │
│   (Routing)     │      │  (Llama 3.3 70B) │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Durable Objects │
│ (State/Memory)  │
└─────────────────┘
\`\`\`

**Key Components:**
1. **LLM**: Llama 3.3 70B Instruct (Workers AI) generates flashcard content
2. **Coordination**: Workers handle API routing + Durable Objects manage state
3. **User Interface**: Web app hosted on Cloudflare Pages
4. **Memory**: Session data persisted in Durable Objects storage

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- A **Cloudflare account** (Free plan works! [Sign up here](https://dash.cloudflare.com/sign-up))
- **Git** installed

### Step 1: Clone & Install


# Clone the repository
git clone https://github.com/YOUR-USERNAME/cf_ai_flashcards.git
cd cf_ai_flashcards

# Install dependencies
npm install

### Step 2: Authenticate with Cloudflare

# Login to your Cloudflare account
npx wrangler login

A browser window will open - click "Allow" to authorize Wrangler.

### Step 3: Enable Workers AI

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Workers & Pages"** in the sidebar
3. Click **"Workers AI"**
4. Click **"Enable Workers AI"** (if not already enabled)

> 💡 The free plan includes 10,000 AI neurons/day - plenty for testing!

### Step 4: Run Locally

Open **two terminal windows**:

**Terminal 1 - Start the Worker:**

cd worker

npx wrangler dev

You should see: \`Ready on http://localhost:8787\`

**Terminal 2 - Start the Pages dev server:**
npx wrangler pages dev pages

You should see: \`Serving at http://localhost:8788\`

**Open your browser** and go to: **http://localhost:8788**

### Step 5: Test It Out!

1. Enter a topic (e.g., "JavaScript Arrays")
2. Click "Generate"
3. Wait a few seconds for the AI to create your flashcards
4. Click any card to flip and see the answer
5. Click the × button to delete cards

## 📦 Deploy to Production

### Deploy the Worker

cd worker

npx wrangler deploy

After deployment, you'll get a URL like:
\`https://cf-ai-flashcards-worker.YOUR-SUBDOMAIN.workers.dev \`

**Copy this URLwrangler pages dev pages* You'll need it in the next step.

### Update the Frontend

1. Open \`pages/main.js\`
2. Find this line:
\` 'https://cf-ai-flashcards-worker.YOUR-SUBDOMAIN.workers.dev' \`
3. Replace \`YOUR-SUBDOMAIN\` with your actual Worker URL

### Deploy Pages

# From the project root
npx wrangler pages deploy pages --project-name=cf-ai-flashcards


After deployment, you'll get a URL like:
\`
https://cf-ai-flashcards.pages.dev
\`

**That's your live app!** 🎉

## 🔧 API Reference

### Generate Flashcards

**Endpoint:** \`POST /api/generate\`

**Request:**
\`json
{
  "topic": "Python Programming",
  "count": 5
}
\`

**Response:**
\`json
{
  "flashcards": [
    {
      "id": "1234567890-0",
      "question": "What is a variable in Python?",
      "answer": "A variable is a container for storing data values...",
      "topic": "Python Programming",
      "createdAt": 1234567890
    }
  ]
}
\`

### Session Management

- \`POST /api/session/init\` - Initialize a new session
- \`POST /api/session/add\` - Add flashcards to session
- \`GET /api/session/list\` - List all flashcards
- \`POST /api/session/delete\` - Delete a flashcard
- \`POST /api/session/clear\` - Clear entire session

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Backend** | TypeScript, Cloudflare Workers |
| **AI Model** | Llama 3.3 70B Instruct FP8 (Workers AI) |
| **State Management** | Durable Objects with SQLite |
| **Hosting** | Cloudflare Pages |

## 📁 Project Structure


cf_ai_flashcards/
├── pages/
│   ├── index.html          # Main UI
│   └── main.js             # Frontend logic
├── worker/
│   ├── index.ts            # Worker API + AI integration
│   ├── FlashcardsDurableObject.ts  # State management
│   └── wrangler.toml       # Worker configuration
├── package.json
├── README.md
├── PROMPTS.md             # AI prompts used in development
└── .gitignore


## 🐛 Troubleshooting

### "Failed to generate flashcards"
- Check that Workers AI is enabled in your Cloudflare dashboard
- Verify you're on the correct pricing plan (Free plan works!)
- Check browser console for detailed error messages

### CORS errors in browser
- Make sure both Worker and Pages dev servers are running
- Check that the API_URL in \`pages/main.js\` is correct

### "Durable Objects error"
- Ensure you deployed with the \`new_sqlite_classes\` migration
- Try redeploying: \`cd worker && npx wrangler deploy\`

### Worker not responding
- Check logs: \`npx wrangler tail\`
- Verify wrangler.toml has correct bindings

## 📝 Development Notes

All AI prompts used during development are documented in \`PROMPTS.md\`.

## 📄 License

MIT License - feel free to use this project for learning or inspiration!

## 🤝 Contributing

Feel free to fork and modify for your own use!

---

**Questions?** Open an issue or check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).
