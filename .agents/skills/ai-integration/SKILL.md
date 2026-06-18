---
name: ai-integration
description: >
  AI integration patterns for RecallStack using Claude (Anthropic) and Gemini
  (Google). Use this skill for every AI feature: note summarization, quiz
  generation, writing assistance, semantic search, related note suggestions,
  and any other AI-powered functionality. Trigger on any mention of Claude,
  Gemini, AI features, summarization, quiz, writing assistant, semantic search,
  AI API, streaming, or token usage. Always consult this before writing any
  AI integration code.
---

# AI Integration Patterns — RecallStack

This skill governs every interaction with the Claude (Anthropic) and Gemini
(Google) APIs in RecallStack. It exists because two providers must be used
consistently, safely, and in a cost-aware way. Every AI call must go through
the patterns defined here.

---

## ABSOLUTE RULES

1. Never call an AI API directly inline in a component or route handler.
   All AI calls go through the unified wrapper defined in this skill.
2. Never expose API keys to the frontend. All AI calls are made from the
   backend (Node.js server). The Next.js frontend calls the RecallStack backend,
   which calls the AI provider.
3. Every AI call must be rate-limited per user. A user cannot trigger more than
   10 AI requests per minute. Confirm this limit with the user before
   implementing — it may need adjustment.
4. Every AI call must log the token usage (input tokens, output tokens, model
   used, user ID, feature name, timestamp) for cost tracking.
5. Every AI call must have a timeout of 30 seconds. If the provider does not
   respond within 30 seconds, return a timeout error to the user.
6. If a provider is unavailable (network error, rate limit from the provider,
   or API key issue), return a clear, user-facing error message. Never silently
   fail or return empty content.
7. All AI features are progressive enhancements. The page must be fully usable
   without the AI feature. AI results load asynchronously and never block
   the initial page render.
8. Before implementing any new AI feature, confirm with the user:
   - Which provider to use (Claude or Gemini)
   - The exact prompt or prompt structure
   - The expected output format
   - Whether to stream or return a complete response

---

## PROVIDER RESPONSIBILITY SPLIT

This is the agreed split between providers. Do not deviate without asking
the user first.

| Feature | Provider | Reason |
|---|---|---|
| Note summarization | Claude | Better at structured summarization of technical content |
| Quiz generation from note | Claude | Better at creating structured question/answer pairs |
| Writing assistant (improve, simplify, expand) | Claude | Better at editing and rewriting technical prose |
| Semantic search re-ranking | Gemini | Used for embedding-based similarity scoring |
| Related note suggestions | Gemini | Embedding similarity between note content |

If a feature is not listed above, confirm with the user before choosing a
provider.

---

## UNIFIED AI CALL WRAPPER

All AI calls in the backend go through this wrapper. It enforces rate limiting,
timeout, logging, and error normalization in one place.

```js
/*
 * FILE: backend/src/services/ai.service.js
 *
 * PURPOSE:
 * Unified wrapper for all AI provider calls in RecallStack.
 * Enforces per-user rate limiting, 30-second timeout, token usage logging,
 * and normalized error handling for both Claude and Gemini.
 * No route handler or other service should call an AI SDK directly —
 * everything goes through callAI().
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory rate limit store. For production, replace with Redis.
// Key: userId, Value: { count: number, windowStart: number }
const rateLimitStore = new Map();

const RATE_LIMIT_MAX = 10;       // max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const TIMEOUT_MS = 30 * 1000;           // 30 second timeout

/*
 * checkRateLimit
 *
 * Checks if a user has exceeded the AI request rate limit.
 * Uses a sliding window counted in memory (replace with Redis in production).
 *
 * @param {string} userId
 * @throws {Error} with message 'RATE_LIMITED' if limit is exceeded
 */
function checkRateLimit(userId) {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    throw new Error('RATE_LIMITED');
  }

  record.count += 1;
}

/*
 * logTokenUsage
 *
 * Records token usage to the database for cost tracking and monitoring.
 * Non-blocking: failures here do not affect the AI response returned to
 * the user.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.feature - e.g. 'note_summary', 'quiz_generation'
 * @param {string} params.provider - 'claude' | 'gemini'
 * @param {string} params.model
 * @param {number} params.inputTokens
 * @param {number} params.outputTokens
 */
async function logTokenUsage({ userId, feature, provider, model, inputTokens, outputTokens }) {
  try {
    // TODO: create an AiUsageLog model in the schema and log here.
    // This is deferred until the schema is confirmed with the user.
    logger.info('ai_token_usage', { userId, feature, provider, model, inputTokens, outputTokens });
  } catch (err) {
    // Logging failure should never affect the user-facing response.
    logger.error('ai_token_log_failed', { err: err.message });
  }
}

/*
 * callClaude
 *
 * Makes a non-streaming request to the Claude API.
 * Returns the text content of the first content block.
 *
 * @param {object} params
 * @param {string} params.userId - for rate limiting and logging
 * @param {string} params.feature - identifier for logging
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {number} [params.maxTokens=1000]
 * @returns {string} The text response from Claude
 */
async function callClaude({ userId, feature, systemPrompt, userPrompt, maxTokens = 1000 }) {
  checkRateLimit(userId);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await anthropic.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      },
      { signal: controller.signal }
    );

    await logTokenUsage({
      userId,
      feature,
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    return response.content[0].text;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI_TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/*
 * callGemini
 *
 * Makes a non-streaming request to the Gemini API.
 * Returns the text response.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.feature
 * @param {string} params.prompt - Gemini uses a single combined prompt
 * @returns {string} The text response from Gemini
 */
async function callGemini({ userId, feature, prompt }) {
  checkRateLimit(userId);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), TIMEOUT_MS)
      ),
    ]);

    const text = result.response.text();

    // Gemini does not expose token counts in the same way.
    // Log what is available.
    await logTokenUsage({
      userId,
      feature,
      provider: 'gemini',
      model: 'gemini-pro',
      inputTokens: 0,
      outputTokens: 0,
    });

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

/*
 * callAI
 *
 * Public interface for all AI calls in RecallStack.
 * Routes to the correct provider based on the feature name.
 * Normalizes errors into user-facing messages.
 *
 * @param {object} params
 * @param {string} params.provider - 'claude' | 'gemini'
 * @param {string} params.feature
 * @param {string} params.userId
 * @param {object} params.prompts - { system?, user } for Claude, { prompt } for Gemini
 * @param {number} [params.maxTokens]
 * @returns {{ success: boolean, data?: string, error?: string }}
 */
export async function callAI({ provider, feature, userId, prompts, maxTokens }) {
  try {
    let result;

    if (provider === 'claude') {
      result = await callClaude({
        userId,
        feature,
        systemPrompt: prompts.system,
        userPrompt: prompts.user,
        maxTokens,
      });
    } else if (provider === 'gemini') {
      result = await callGemini({
        userId,
        feature,
        prompt: prompts.prompt,
      });
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    return { success: true, data: result };
  } catch (err) {
    if (err.message === 'RATE_LIMITED') {
      return { success: false, error: 'You have made too many AI requests. Please wait a moment and try again.' };
    }
    if (err.message === 'AI_TIMEOUT') {
      return { success: false, error: 'The AI took too long to respond. Please try again.' };
    }
    logger.error('ai_call_failed', { feature, provider, err: err.message });
    return { success: false, error: 'The AI feature is temporarily unavailable. Please try again later.' };
  }
}
```

---

## FEATURE IMPLEMENTATIONS

### Note Summarization (Claude)

```js
/*
 * Generates a 3-5 sentence summary of a note from its sections.
 * Called from note.service.js, not directly from the route handler.
 *
 * The summary is not stored in the database — it is generated on demand
 * and returned to the client. If caching is needed, confirm with the user
 * before implementing it.
 */
export async function generateNoteSummary({ note, userId }) {
  const sectionText = note.sections
    .map((s) => `${s.title}\n${s.content}`)
    .join('\n\n');

  return callAI({
    provider: 'claude',
    feature: 'note_summary',
    userId,
    maxTokens: 300,
    prompts: {
      system:
        'You are a technical note summarizer. Write clear, accurate summaries of programming and computer science notes. Do not add information that is not in the source material.',
      user: `Summarize the following note in 3 to 5 sentences. Focus on the key concepts and what someone would learn from reading it.\n\nNote title: ${note.title}\n\n${sectionText}`,
    },
  });
}
```

### Quiz Generation (Claude)

```js
/*
 * Generates interview-style questions from a note's content.
 * Returns structured JSON: array of { question, answer, difficulty } objects.
 * The prompt instructs Claude to return only JSON with no preamble.
 */
export async function generateNoteQuiz({ note, userId, questionCount = 5 }) {
  const sectionText = note.sections
    .map((s) => `${s.title}\n${s.content}`)
    .join('\n\n');

  const result = await callAI({
    provider: 'claude',
    feature: 'quiz_generation',
    userId,
    maxTokens: 1000,
    prompts: {
      system:
        'You are a technical interview question generator. You create clear, accurate questions from technical notes. You always respond with valid JSON only — no explanation, no preamble, no markdown code fences.',
      user: `Generate ${questionCount} interview questions from the following note. Return a JSON array where each object has: "question" (string), "answer" (string, 2-4 sentences), and "difficulty" ("easy", "medium", or "hard").\n\nNote title: ${note.title}\n\n${sectionText}`,
    },
  });

  if (!result.success) return result;

  try {
    const questions = JSON.parse(result.data);
    return { success: true, data: questions };
  } catch {
    // Claude returned something that is not valid JSON.
    // This should be rare given the prompt, but must be handled.
    return { success: false, error: 'Quiz generation produced an invalid response. Please try again.' };
  }
}
```

### Writing Assistant (Claude)

```js
/*
 * Rewrites a section's content based on a mode.
 * mode: 'improve' | 'simplify' | 'expand'
 * Returns the rewritten content as a string.
 * The user reviews the output before saving — this never auto-saves.
 */
export async function rewriteSection({ section, mode, userId }) {
  const modeInstructions = {
    improve: 'Improve the clarity and accuracy of this technical content. Fix awkward phrasing, improve structure, and make it easier to understand. Keep the same information.',
    simplify: 'Simplify this technical content for a beginner audience. Use plain language and avoid jargon where possible. Keep the key concepts.',
    expand: 'Expand this technical content with more detail, examples, and explanation. Add depth without adding inaccurate information.',
  };

  return callAI({
    provider: 'claude',
    feature: `writing_assistant_${mode}`,
    userId,
    maxTokens: 800,
    prompts: {
      system: 'You are a technical writing assistant. You rewrite technical content clearly and accurately.',
      user: `${modeInstructions[mode]}\n\nSection title: ${section.title}\n\nContent:\n${section.content}`,
    },
  });
}
```

---

## ERROR STATES IN THE UI

Every AI feature in the frontend must handle three states:

```
idle      Initial state. Shows the trigger button (e.g. "Generate Summary").
loading   AI call is in progress. Shows a spinner. Button is disabled.
          Never block the rest of the page during this state.
error     Call failed. Shows the error message from the API response.
          Shows a "Try again" button. Never shows a technical error.
success   Shows the AI-generated content.
```

The component that renders AI output must never be a server component.
Use a client component with `useState` for the three states above.

```js
/*
 * Example pattern for an AI feature button in a client component.
 * Replace 'generateSummary' with the relevant API call.
 */
const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
const [result, setResult] = useState(null);
const [errorMessage, setErrorMessage] = useState('');

async function handleClick() {
  setState('loading');
  const response = await fetch(`/api/notes/${noteId}/summary`, { method: 'POST' });
  const data = await response.json();

  if (data.success) {
    setResult(data.data);
    setState('success');
  } else {
    setErrorMessage(data.error);
    setState('error');
  }
}
```

---

## ENVIRONMENT VARIABLES

These must be present in `backend/.env`. Never put AI keys in the frontend
`.env.local`.

```
ANTHROPIC_API_KEY=        your Anthropic API key
GEMINI_API_KEY=           your Google Gemini API key
```

Add these to the README environment variables table with descriptions but
never with actual key values.

---

## FUTURE AI FEATURES (not yet scoped)

These are mentioned in the architecture but not yet designed. Do not implement
any of them until the user explicitly confirms scope, provider, and prompt
strategy for each.

- Semantic search re-ranking using Gemini embeddings
- Related note suggestions using Gemini embeddings
- AI-generated note tags from content
- AI difficulty rating suggestion

When the user is ready to implement one of these, ask:
1. Which provider and model
2. Whether embeddings need to be stored (requires a vector column or pgvector)
3. The expected latency tolerance (real-time vs background job)
