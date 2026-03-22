const axios = require("axios");
const AiQuestion = require("../../models/AIQuestion");
const ChatHistory = require("../../models/ChatHistory");

// ===================== CONFIGURATION =====================
const LANGCHAIN_API_URL =
  process.env.LANGCHAIN_API_URL || "http://127.0.0.1:8000/query";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

const CHAT_CONTEXT_INSTRUCTION =
  "You are continuing an ongoing chat. Use the full conversation history for continuity, and answer the latest user question directly.";

// ===================== HELPERS =====================

const sanitizeAIAnswer = (text) => {
  if (typeof text !== "string") return String(text || "");
  return text.trim();
};

/**
 * Exponential backoff with jitter for retrying failed LLM calls.
 * Prevents synchronized thundering herd attacks on the Groq API.
 * Formula: delay = min(baseDelay * 2^attempt + random_jitter, maxDelay)
 */
const callWithBackoff = async (axiosConfig, maxRetries = 3) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 15000; // 15 seconds cap

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios(axiosConfig);
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryable = !err.response || err.response.status >= 500 || err.response.status === 429;

      if (isLastAttempt || !isRetryable) {
        throw err;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 500;
      const delay = Math.min(baseDelay * Math.pow(2, attempt) + jitter, maxDelay);
      console.log(`[AI Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Build the Axios config with internal API key header for FastAPI bridge security.
 */
const buildAIRequestConfig = (query, top_k = 3) => ({
  method: 'post',
  url: LANGCHAIN_API_URL,
  data: { query, top_k },
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    ...(INTERNAL_API_KEY ? { 'X-Internal-API-Key': INTERNAL_API_KEY } : {}),
  },
});

const AI_RESTING_MESSAGE =
  "Our AI assistant is currently resting 💤. Please try again in a few moments.";

const buildContextualQuery = (messages, latestUserQuery) => {
  const safeLatestQuery =
    typeof latestUserQuery === "string" ? latestUserQuery.trim() : "";

  if (!Array.isArray(messages) || messages.length <= 1) {
    return safeLatestQuery;
  }

  // Exclude the most recent user message from history because it is appended separately.
  const previousMessages = messages.slice(0, -1);

  const historyText = previousMessages
    .filter(
      (msg) =>
        msg &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string" &&
        msg.content.trim()
    )
    .map((msg) => {
      const roleLabel = msg.role === "assistant" ? "Assistant" : "User";
      return `${roleLabel}: ${msg.content.trim()}`;
    })
    .join("\n");

  if (!historyText) {
    return safeLatestQuery;
  }

  return [
    CHAT_CONTEXT_INSTRUCTION,
    "",
    "Conversation history:",
    historyText,
    "",
    `Latest user question: ${safeLatestQuery}`,
  ].join("\n");
};

// ===================== CONTROLLERS =====================

// POST /api/ai/chats — Create new chat or append to existing
const queryAI = async (req, res) => {
  const { query, chatId } = req.body;
  const userId = req.user._id;

  if (!query || !query.trim()) {
    return res.status(400).json({ ok: false, message: "Query is required" });
  }

  try {
    let chatHistory = null;
    let isNewChat = false;

    if (chatId) {
      chatHistory = await ChatHistory.findOne({ _id: chatId, userId });
    }

    if (!chatHistory) {
      let title = query.trim().split('\n')[0].substring(0, 40);
      if (title.length < query.trim().length) title += '...';
      chatHistory = new ChatHistory({ userId, title, messages: [] });
      isNewChat = true;
    }

    const userMessage = { role: "user", content: query.trim() };
    chatHistory.messages.push(userMessage);

    const contextualQuery = buildContextualQuery(
      chatHistory.messages,
      userMessage.content
    );

    let aiResponseContent = "";
    try {
      const config = buildAIRequestConfig(contextualQuery, 3);
      const response = await callWithBackoff(config);
      aiResponseContent =
        response.data.answer ||
        response.data.response ||
        "No response received";
      aiResponseContent = sanitizeAIAnswer(aiResponseContent);
    } catch (err) {
      console.error("[AI Chat] All retry attempts failed:", err.message);
      aiResponseContent = AI_RESTING_MESSAGE;
    }

    const aiMessage = { role: "assistant", content: aiResponseContent };
    chatHistory.messages.push(aiMessage);
    await chatHistory.save();

    res.json({
      ok: true,
      chatId: chatHistory._id,
      title: chatHistory.title,
      isNewChat,
      aiResponse: aiMessage,
    });
  } catch (err) {
    console.error("[AI Chat] Internal Error:", err.message);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
};

// GET /api/ai/chats — get list of all chat sessions for current user
const getChatHistory = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user._id })
      .select('_id title updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ ok: true, chats });
  } catch (err) {
    console.error("[AI getChatHistory] Error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to fetch chat history list" });
  }
};

// GET /api/ai/chats/:id — get full messages for a specific chat
const getSingleChat = async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ ok: false, message: "Chat not found" });
    }
    res.json({ ok: true, chat });
  } catch (err) {
    console.error("[AI getSingleChat] Error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to fetch chat messages" });
  }
};

// POST /api/ai/ask — original RANKLEN style: individual Q&A documents
const askQuestion = async (req, res) => {
  try {
    const { query, top_k = 3, sessionId } = req.body;
    const userId = req.user._id;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    let aiResponse;
    try {
      const config = buildAIRequestConfig(query.trim(), top_k);
      const response = await callWithBackoff(config);
      aiResponse = response.data;
    } catch (apiError) {
      console.error("[AI askQuestion] All retry attempts failed:", apiError.message);
      return res.status(503).json({
        success: false,
        message: AI_RESTING_MESSAGE,
      });
    }

    const questionData = {
      userId,
      question: query.trim(),
      answer: sanitizeAIAnswer(
        aiResponse.answer || aiResponse.response || "No response received"
      ),
      topK: top_k,
      sources: aiResponse.sources || [],
      sessionId: sessionId || null,
    };

    const savedQuestion = await AiQuestion.create(questionData);

    res.json({
      success: true,
      data: {
        id: savedQuestion._id,
        question: savedQuestion.question,
        answer: savedQuestion.answer,
        sources: savedQuestion.sources,
        createdAt: savedQuestion.createdAt,
      },
    });
  } catch (error) {
    console.error("[AI askQuestion] Internal Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to process your question" });
  }
};

// GET /api/ai/history — paginated question history (original RANKLEN style)
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      AiQuestion.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("question answer sources createdAt sessionId"),
      AiQuestion.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[AI getHistory] Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

// DELETE /api/ai/chats/:id — delete a chat session (or question)
const deleteChat = async (req, res) => {
  try {
    // Try deleting from ChatHistory first
    const chat = await ChatHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (chat) {
      return res.json({ success: true, ok: true, message: "Chat deleted successfully" });
    }

    // Try AiQuestion as fallback (legacy)
    const question = await AiQuestion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (question) {
      return res.json({ success: true, ok: true, message: "Question deleted successfully" });
    }

    return res.status(404).json({ success: false, ok: false, message: "Not found or unauthorized" });
  } catch (error) {
    console.error("[AI deleteChat] Error:", error.message);
    res.status(500).json({ success: false, ok: false, message: "Failed to delete" });
  }
};

// DELETE /api/ai/history/clear — clear all history (both models)
const clearHistory = async (req, res) => {
  try {
    const aiQuestionsResult = await AiQuestion.deleteMany({ userId: req.user._id });
    const chatHistoryResult = await ChatHistory.deleteMany({ userId: req.user._id });

    console.log(`[AI clearHistory] Cleared ${aiQuestionsResult.deletedCount} questions and ${chatHistoryResult.deletedCount} chats for user ${req.user._id}`);

    res.json({ success: true, message: "History cleared successfully" });
  } catch (error) {
    console.error("[AI clearHistory] Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to clear history" });
  }
};

module.exports = {
  askQuestion,
  getHistory,
  deleteChat,
  clearHistory,
  queryAI,
  getChatHistory,
  getSingleChat,
};
