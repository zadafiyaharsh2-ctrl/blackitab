const axios = require("axios");
const AIQuestion = require("../models/AIQuestion");
const ChatHistory = require("../models/ChatHistory");

// ===================== DEBUG CONFIGURATION =====================
const DEBUG = true; // Set to false to disable all debug logging
const debugLog = (label, data) => {
  if (!DEBUG) return;
  console.log("\n========================================");
  console.log(`🔍 DEBUG [${new Date().toISOString()}] - ${label}`);
  console.log("----------------------------------------");
  if (typeof data === "object") {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
  console.log("========================================\n");
};

const debugError = (label, error) => {
  if (!DEBUG) return;
  console.log("\n❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌");
  console.log(`🚨 ERROR [${new Date().toISOString()}] - ${label}`);
  console.log("----------------------------------------");
  console.log("Message:", error.message);
  console.log("Name:", error.name);
  console.log("Stack:", error.stack);
  if (error.response) {
    console.log("Response Status:", error.response.status);
    console.log("Response Data:", JSON.stringify(error.response.data, null, 2));
    console.log(
      "Response Headers:",
      JSON.stringify(error.response.headers, null, 2),
    );
  }
  if (error.request) {
    console.log("Request URL:", error.config?.url);
    console.log("Request Method:", error.config?.method);
    console.log("Request Data:", JSON.stringify(error.config?.data, null, 2));
  }
  console.log("❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n");
};
// ===============================================================

const LANGCHAIN_API_URL =
  process.env.LANGCHAIN_API_URL || "http://127.0.0.1:8000/query";

// Log environment configuration on startup
debugLog("AI Controller Initialized", {
  LANGCHAIN_API_URL,
  ENV_LANGCHAIN_URL: process.env.LANGCHAIN_API_URL || "NOT SET (using default)",
  NODE_ENV: process.env.NODE_ENV || "NOT SET",
});

// POST /api/ai/chats — Create new chat or append to existing
const queryAI = async (req, res) => {
  debugLog("queryAI - Request Received", {
    body: req.body,
    headers: {
      "content-type": req.headers["content-type"],
      authorization: req.headers.authorization ? "Bearer ***" : "NOT PROVIDED",
    },
    user: req.user
      ? { _id: req.user._id, email: req.user.email }
      : "NOT AUTHENTICATED",
  });

  const { query, chatId } = req.body;
  const userId = req.user._id;

  if (!query || !query.trim()) {
    debugLog("queryAI - Validation Failed", { reason: "Empty query", query });
    return res.status(400).json({ ok: false, message: "Query is required" });
  }

  debugLog("queryAI - Processing", {
    query: query.trim(),
    chatId: chatId || "NEW",
    userId: userId.toString(),
  });

  try {
    let chatHistory = null;
    let isNewChat = false;

    if (chatId) {
      chatHistory = await ChatHistory.findOne({ _id: chatId, userId });
      debugLog("queryAI - Chat History Lookup", {
        found: !!chatHistory,
        existingMessagesCount: chatHistory?.messages?.length || 0,
      });
    }

    if (!chatHistory) {
      // Create a short title from the first query
      let title = query.trim().split('\n')[0].substring(0, 40);
      if (title.length < query.trim().length) title += '...';

      chatHistory = new ChatHistory({ userId, title, messages: [] });
      isNewChat = true;
      debugLog("queryAI - Created New Chat History", {
        userId: userId.toString(),
        title
      });
    }

    const userMessage = { role: "user", content: query.trim() };
    chatHistory.messages.push(userMessage);

    let aiResponseContent = "";
    try {
      debugLog("queryAI - Calling LangChain API", {
        url: LANGCHAIN_API_URL,
        payload: { query: query.trim(), top_k: 3 },
        timeout: 60000,
      });

      const startTime = Date.now();
      const response = await axios.post(
        LANGCHAIN_API_URL,
        {
          query: query.trim(),
          top_k: 3,
        },
        { timeout: 60000 },
      );
      const responseTime = Date.now() - startTime;

      debugLog("queryAI - LangChain API Response", {
        status: response.status,
        responseTime: `${responseTime}ms`,
        dataKeys: Object.keys(response.data || {}),
        hasAnswer: !!response.data?.answer,
        hasResponse: !!response.data?.response,
      });

      aiResponseContent =
        response.data.answer ||
        response.data.response ||
        "No response received";
    } catch (err) {
      debugError("queryAI - AI Server Error", err);
      aiResponseContent =
        "I am currently unable to reach the AI engine. Please try again later.";
    }

    const aiMessage = { role: "assistant", content: aiResponseContent };
    chatHistory.messages.push(aiMessage);

    debugLog("queryAI - Saving Chat History", {
      totalMessages: chatHistory.messages.length,
      lastUserMessage: userMessage.content.substring(0, 50) + "...",
      lastAIResponse: aiResponseContent.substring(0, 50) + "...",
    });

    await chatHistory.save();

    const responsePayload = {
      ok: true,
      chatId: chatHistory._id,
      title: chatHistory.title,
      isNewChat,
      aiResponse: aiMessage,
    };

    debugLog("queryAI - Sending Response", responsePayload);

    res.json(responsePayload);
  } catch (err) {
    debugError("queryAI - Internal Error", err);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
};

// GET /api/ai/chats — get list of all chat sessions for current user
const getChatHistory = async (req, res) => {
  debugLog("getChatHistory - Request Received", {
    user: req.user
      ? { _id: req.user._id, email: req.user.email }
      : "NOT AUTHENTICATED",
  });

  try {
    const chats = await ChatHistory.find({ userId: req.user._id })
      .select('_id title updatedAt')
      .sort({ updatedAt: -1 });

    debugLog("getChatHistory - Result", {
      chatsCount: chats.length,
    });

    res.json({ ok: true, chats });
  } catch (err) {
    debugError("getChatHistory - Error", err);
    res
      .status(500)
      .json({ ok: false, message: "Failed to fetch chat history list" });
  }
};

// GET /api/ai/chats/:id — get full messages for a specific chat
const getSingleChat = async (req, res) => {
  debugLog("getSingleChat - Request Received", {
    chatId: req.params.id,
    user: req.user ? { _id: req.user._id } : "NOT AUTHENTICATED",
  });

  try {
    const chat = await ChatHistory.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!chat) {
      return res.status(404).json({ ok: false, message: "Chat not found" });
    }

    res.json({ ok: true, chat });
  } catch (err) {
    debugError("getSingleChat - Error", err);
    res.status(500).json({ ok: false, message: "Failed to fetch chat messages" });
  }
};

// POST /api/ai/ask — original blackitab style: individual Q&A documents
const askQuestion = async (req, res) => {
  debugLog("askQuestion - Request Received", {
    body: req.body,
    headers: {
      "content-type": req.headers["content-type"],
      authorization: req.headers.authorization ? "Bearer ***" : "NOT PROVIDED",
    },
    user: req.user
      ? { _id: req.user._id, email: req.user.email }
      : "NOT AUTHENTICATED",
  });

  try {
    const { query, top_k = 3, sessionId } = req.body;
    const userId = req.user._id;

    if (!query || !query.trim()) {
      debugLog("askQuestion - Validation Failed", {
        reason: "Empty query",
        query,
      });
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    debugLog("askQuestion - Processing", {
      query: query.trim(),
      top_k,
      sessionId,
      userId: userId.toString(),
    });

    let aiResponse;
    try {
      debugLog("askQuestion - Calling LangChain API", {
        url: LANGCHAIN_API_URL,
        payload: { query: query.trim(), top_k },
        timeout: 60000,
      });

      const startTime = Date.now();
      const response = await axios.post(
        LANGCHAIN_API_URL,
        { query: query.trim(), top_k },
        { timeout: 60000 },
      );
      const responseTime = Date.now() - startTime;

      debugLog("askQuestion - LangChain API Response", {
        status: response.status,
        responseTime: `${responseTime}ms`,
        dataKeys: Object.keys(response.data || {}),
        rawData: response.data,
      });

      aiResponse = response.data;
    } catch (apiError) {
      debugError("askQuestion - LangChain API Error", apiError);
      return res
        .status(503)
        .json({
          success: false,
          message:
            "AI service is currently unavailable. Please try again later.",
          error: apiError.message,
        });
    }

    const questionData = {
      userId,
      question: query.trim(),
      answer:
        aiResponse.answer || aiResponse.response || "No response received",
      topK: top_k,
      sources: aiResponse.sources || [],
      sessionId: sessionId || null,
    };

    debugLog("askQuestion - Saving Question", questionData);

    const savedQuestion = await AIQuestion.create(questionData);

    debugLog("askQuestion - Question Saved", {
      id: savedQuestion._id,
      createdAt: savedQuestion.createdAt,
    });

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
    debugError("askQuestion - Internal Error", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to process your question",
        error: error.message,
      });
  }
};

// GET /api/ai/history — paginated question history (original blackitab style)
const getHistory = async (req, res) => {
  debugLog("getHistory - Request Received", {
    query: req.query,
    user: req.user
      ? { _id: req.user._id, email: req.user.email }
      : "NOT AUTHENTICATED",
  });

  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    debugLog("getHistory - Pagination Config", {
      page,
      limit,
      skip,
      userId: userId.toString(),
    });

    const [questions, total] = await Promise.all([
      AIQuestion.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("question answer sources createdAt sessionId"),
      AIQuestion.countDocuments({ userId }),
    ]);

    debugLog("getHistory - Result", {
      questionsReturned: questions.length,
      totalQuestions: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      firstQuestion: questions[0]
        ? {
            id: questions[0]._id,
            question: questions[0].question.substring(0, 50) + "...",
          }
        : null,
    });

    res.json({
      success: true,
      data: questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    debugError("getHistory - Error", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch history",
        error: error.message,
      });
  }
};

// DELETE /api/ai/chats/:id — delete a chat session (or question)
const deleteChat = async (req, res) => {
  debugLog("deleteChat - Request Received", {
    chatId: req.params.id,
    user: req.user ? { _id: req.user._id } : "NOT AUTHENTICATED",
  });

  try {
    // Try deleting from ChatHistory first
    const chat = await ChatHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (chat) {
      debugLog("deleteChat - Deleted ChatHistory", { id: chat._id });
      return res.json({ success: true, ok: true, message: "Chat deleted successfully" });
    }

    // Try APIQuestion as fallback (legacy)
    const question = await AIQuestion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    
    if (question) {
      debugLog("deleteChat - Deleted AIQuestion", { id: question._id });
      return res.json({ success: true, ok: true, message: "Question deleted successfully" });
    }

    return res.status(404).json({ success: false, ok: false, message: "Not found or unauthorized" });
  } catch (error) {
    debugError("deleteChat - Error", error);
    res.status(500).json({ success: false, ok: false, message: "Failed to delete" });
  }
};

// DELETE /api/ai/history/clear — clear all history (both models)
const clearHistory = async (req, res) => {
  debugLog("clearHistory - Request Received", {
    user: req.user
      ? { _id: req.user._id, email: req.user.email }
      : "NOT AUTHENTICATED",
  });

  try {
    const aiQuestionsResult = await AIQuestion.deleteMany({
      userId: req.user._id,
    });
    const chatHistoryResult = await ChatHistory.deleteMany({
      userId: req.user._id,
    });

    debugLog("clearHistory - Result", {
      aiQuestionsDeleted: aiQuestionsResult.deletedCount,
      chatHistoryDeleted: chatHistoryResult.deletedCount,
      userId: req.user._id.toString(),
    });

    res.json({ success: true, message: "History cleared successfully" });
  } catch (error) {
    debugError("clearHistory - Error", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to clear history",
        error: error.message,
      });
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
