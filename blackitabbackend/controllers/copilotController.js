const { ChatOpenAI } = require("@langchain/openai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");

const { getComprehensiveAnalytics } = require("./analyticsController");

function getHistoryLimit() {
    const parsed = Number(process.env.COPILOT_HISTORY_LIMIT || 6);
    if (Number.isNaN(parsed)) {
        return 6;
    }
    return Math.min(6, Math.max(4, parsed));
}

function isPerformanceQuery(text) {
    if (!text || typeof text !== "string") {
        return false;
    }
    const input = text.toLowerCase();
    const keywords = [
        "performance", "progress", "weak", "weakest", "strong", "strongest",
        "accuracy", "score", "marks", "rank", "improve", "study", "subject",
        "analytics", "analysis", "practice", "how am i doing", "what should i study",
        "study plan", "study time", "optimize", "revise", "revision", "focus areas",
        "where should i focus", "what to focus", "topics to practice"
    ];
    return keywords.some((keyword) => input.includes(keyword));
}

function toEssentialAnalytics(data) {
    const normalizeSubject = (subject) => {
        if (!subject || typeof subject !== "object") {
            return null;
        }
        return {
            name: subject.subject || subject.name || null,
            accuracy: subject.accuracyPercentage ?? subject.accuracy ?? null,
        };
    };

    const allSubjects = Array.isArray(data?.allSubjects)
        ? data.allSubjects.map(normalizeSubject).filter((subject) => subject?.name)
        : [];

    return {
        weakestSubject: normalizeSubject(data?.weakestSubject),
        strongestSubject: normalizeSubject(data?.strongestSubject),
        allSubjects,
    };
}

function formatMessageForDebug(msg) {
    const role = msg?._getType?.() || "unknown";
    const content = Array.isArray(msg?.content) ? JSON.stringify(msg.content) : (msg?.content ?? "");
    return {
        role,
        content,
    };
}

function extractUsage(aiMessage) {
    const usage = aiMessage?.usage_metadata;
    if (!usage) {
        return null;
    }
    return {
        input_tokens: usage.input_tokens ?? 0,
        output_tokens: usage.output_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0,
    };
}

function createModel() {
    const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();

    if (provider === "gemini") {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required when LLM_PROVIDER=gemini");
        }
        return {
            provider,
            modelName: process.env.GEMINI_MODEL || "gemini-1.5-flash",
            model: new ChatGoogleGenerativeAI({
                apiKey,
                model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
                temperature: 0.7,
            }),
        };
    }

    return {
        provider: "openai",
        modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
        model: new ChatOpenAI({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.7,
        }),
    };
}

exports.generateCopilotResponse = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const debugEnabled = process.env.COPILOT_DEBUG === "true";
        const includeDebugInResponse = req.query.debug === "1";
        
        // Extract userId strictly from the JWT, NEVER from req.body
        const userId = req.user?._id || req.user?.id; 

        if (!userId || !message) {
            return res.status(400).json({ success: false, error: "Unauthenticated or message missing." });
        }

        const { model, provider, modelName } = createModel();

        const historyLimit = getHistoryLimit();
        const limitedHistory = Array.isArray(history) ? history.slice(-historyLimit) : [];
        const chatHistory = limitedHistory.map(msg => {
            if (msg.role === 'user' || msg.type === 'human') {
                return new HumanMessage(msg.content);
            } else {
                return new AIMessage(msg.content);
            }
        });
        const shouldUseAnalyticsContext = isPerformanceQuery(message);
        let analyticsContext = null;
        if (shouldUseAnalyticsContext) {
            const analyticsData = await getComprehensiveAnalytics(userId);
            analyticsContext = toEssentialAnalytics(analyticsData);
        }

        const systemInstruction = analyticsContext
            ? `You are Ranklen Copilot. Reply in 4 sentences or less with clear, actionable study advice. Personalize recommendations strictly using this student analytics context: ${JSON.stringify(analyticsContext)}`
            : "You are Ranklen Copilot. Reply in 4 sentences or less with clear, actionable study advice.";

        const messages = [
            new SystemMessage(systemInstruction),
            ...chatHistory,
            new HumanMessage(message),
        ];

        if (debugEnabled) {
            console.log("[Copilot Debug] Outgoing payload (first invoke):", messages.map(formatMessageForDebug));
        }

        let response = await model.invoke(messages);
        const firstCallUsage = extractUsage(response);
        if (debugEnabled && firstCallUsage) {
            console.log("[Copilot Debug] Token usage (first invoke):", firstCallUsage);
        }
        const secondCallUsage = null;

        const reply = typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);

        const debug = {
            request_payload_first_invoke: messages.slice(0, 2 + chatHistory.length).map(formatMessageForDebug),
            provider,
            model: modelName,
            analytics_context_included: shouldUseAnalyticsContext,
            analytics_context: analyticsContext,
            history_messages_sent: limitedHistory.length,
            usage: {
                first_invoke: firstCallUsage,
                second_invoke: secondCallUsage,
                total: {
                    input_tokens: (firstCallUsage?.input_tokens || 0) + (secondCallUsage?.input_tokens || 0),
                    output_tokens: (firstCallUsage?.output_tokens || 0) + (secondCallUsage?.output_tokens || 0),
                    total_tokens: (firstCallUsage?.total_tokens || 0) + (secondCallUsage?.total_tokens || 0),
                }
            }
        };

        return res.status(200).json({
            success: true,
            reply,
            ...(includeDebugInResponse ? { debug } : {})
        });

    } catch (error) {
        console.error("[Copilot Error]:", error); 
        return res.status(500).json({ success: false, error: "AI failed to respond." });
    }
};
