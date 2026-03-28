# AI Service Cost Control

BlackiTab integrates directly with LLM endpoints (via `LANGCHAIN_API_URL` / FastAPI wrappers or direct Groq/OpenAI endpoints) for features such as:
1. Student `Ask AI` Tutor
2. Teacher Question Generation

## The Risk
LLM APIs charge per token. If endpoints are left unprotected, malicious scripts or accidental loops could generate tens of thousands of requests per hour, draining prepaid credits completely.

## Implemented Safeguards

### 1. Express Rate Limiting
To prevent abuse, we have introduced rigid API-level chokes via `express-rate-limit`:

- **Teacher Question Generation:** (`/api/ai-questions/generate`)
  - **Limit:** 20 Requests / Hour / IP
  - *Reasoning:* A teacher should optimally generate a batch of exams efficiently. Beyond 20 full-batch generations in 60 minutes indicates abuse or a compromised account.
  
- **Student AI Tutor Chat:** (`/api/ai/chats`)
  - **Limit:** 50 Requests / 15 Minutes / IP
  - *Reasoning:* Average back-and-forth tutoring shouldn't exceed dense rapid-fire queries. This is roughly 1 request every 18 seconds consecutively, capping token blasts.

### 2. Output Formatting Restrictions
In `aiQuestionController.js`, queries mandate strict JSON configurations which naturally force the LLM to skip generative conversational fluff, significantly lowering output token usage per request.

### 3. Jitter and Backoff (`aiController.js`)
If the FastAPI backend returns `429 Too Many Requests` (the overarching limit set by Groq etc.), the Node backend will automatically backoff exponentially (delaying responses securely) before retrying, preventing a thundering herd crash.
