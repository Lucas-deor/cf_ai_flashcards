#### **PROMPTS.md**

```markdown
# AI Prompts Used in Development

This document contains all AI prompts used during the development of this project.

## Project Architecture

**Prompt**: "Design a serverless AI flashcard generator using Cloudflare Workers AI (Llama 3.3), durable objects for state management, and pages for the frontend. The app should allow users to input topics and generate flashcards with questions and answers."

## Backend Implementation

### Durable Objects State Management

**Prompt**: "Create a TypeScript Durable Object class for managing flashcard sessions. It should:
- Store flashcards with id, question, answer, topic, and createdAt
- Support CRUD operations (create, read, delete)
- Handle multiple sessions with user IDs
- Include CORS headers for frontend access"

### Worker with AI Integration

**Prompt**: "Implement a cloudflare worker that:
- Routes requests to /api/generate for AI flashcard generation
- Integrates with Workers AI using Llama 3.3 70B model
- Parses AI responses and formats them as flashcard objects
- Routes session management requests to durable objects
- Handles errors with proper CORS"

### AI Prompt Engineering

**Prompt for Llama 3.3**: "Generate ${count} educational flashcards about \"${topic}\". 
For each flashcard, create a question and a detailed answer.
Format your response as valid JSON array with this structure:
[
  {
    \"question\": \"What is...\",
    \"answer\": \"The answer is...\"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text, no markdown formatting, no explanations."

**Note**: This prompt was refined through iterations to ensure clean JSON output from the LLM.

## Frontend Implementation

### UI Design

**Prompt**: "Create a modern, responsive HTML/CSS interface for a flashcard app with:
- Gradient background
- Input fields for topic and count
- Grid layout for displaying flashcards
- Flip animation on click
- Delete button on each card
- Statistics showing total cards and topics
- Loading spinner during AI generation"

### JavaScript Logic

**Prompt**: "Implement vanilla javascript to:
- Make API calls to worker endpoints
- Handle session management with localStorage
- Render flashcards dynamically
- Implement card flip functionality
- Handle CRUD operations (create, delete)
- Show loading states and error handling
- Support both local development and production URLs"

## Configuration

### Wrangler Setup

**Prompt**: "Create a wrangler.toml configuration for:
- Workers AI binding with Llama model access
- Durable objects binding and migration
- TypeScript support
- Node.js compatibility"

## Documentation

**Prompt**: "Write a comprehensive README.md that includes:
- Project description and features
- Architecture diagram
- Local development setup instructions
- Deployment steps
- API documentation
- Tech stack overview
- Usage instructions"

---

## Notes

All prompts were used with Claude Sonnet 4.5 (via GitHub Copilot) for code generation and guidance. The AI assisted in:
1. Architectural decisions
2. TypeScript/JavaScript implementation
3. Cloudflare-specific configurations
4. UI/UX design
5. Documentation writing

Llama 3.3 70B (via Workers AI) is used in the production application for generating flashcard content.