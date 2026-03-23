const { ChatOpenAI } = require("@langchain/openai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");
const { getComprehensiveAnalytics } = require("./analyticsController");
// Note: analytics builder is moved to a dedicated service to keep controller lean.
const { getTeacherAnalyticsContext } = require("../services/teacherAnalyticsService");

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const COPILOT_HISTORY_LIMIT = Math.min(6, Math.max(4, Number(process.env.COPILOT_HISTORY_LIMIT) || 6));
const DEBUG_ENABLED = process.env.COPILOT_DEBUG === "true";

// ============================================================================
// 2. INTENT CLASSIFIERS (Heuristics)
// ============================================================================
const INTENTS = {
    performance: /performance|progress|weak|strong|accuracy|score|marks|rank|improve|study|analytics|focus/i,
    teacherAnalytics: /student|class|batch|attendance|present|absent|topper|at risk/i,
    institute: /institute|college|school|overview|dashboard|departments|staff|subscription/i,
    directory: /list teachers|all teachers|teacher list|department teachers/i
};

const detectIntent = (text, intentRegex) => text ? intentRegex.test(text) : false;

// ============================================================================
// 3. LLM FACTORY (Model Initialization)
// ============================================================================
const initializeLLM = () => {
    const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();

    if (provider === "gemini") {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("Missing Gemini API Key");
        return {
            provider,
            modelName: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            model: new ChatGoogleGenerativeAI({
                apiKey,
                model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
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
};

// ============================================================================
// 4. PROMPT ENGINEERING ENGINE
// ============================================================================
const getRoleConfiguration = (role) => {
    const configs = {
        teacher: {
            instruction: "You are Ranklen Copilot for teachers. Reply in 5 sentences or less. Answer only what the user asks based strictly on the provided context.",
            template: "teacher"
        },
        hod: {
            instruction: "You are Ranklen Copilot for HODs. Reply in 6 sentences or less. Provide department-level insights strictly based on the context.",
            template: "hod"
        },
        institute: {
            instruction: "You are Ranklen Copilot for institute admins. Reply in 6 sentences or less. Summarize high-level platform metrics.",
            template: "institute"
        },
        student: {
            instruction: "You are Ranklen Copilot. Reply in 4 sentences or less. Be brutally honest, actionable, and mathematically precise.",
            template: "student"
        }
    };
    return configs[role] || configs.student;
};

// ============================================================================
// 5. THE MAIN CONTROLLER
// ============================================================================
exports.generateCopilotResponse = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const userId = req.user?._id || req.user?.id;
        const userRole = req.user?.role || "student";
        const includeDebug = req.query.debug === "1";

        // 1. Validation
        if (!userId || !message) {
            return res.status(401).json({ success: false, error: "Unauthorized or missing input." });
        }

        // 2. Context Routing & Fetching
        let analyticsContext = null;
        let contextType = "general";

        if (["teacher", "hod", "institute"].includes(userRole)) {
            if (
                detectIntent(message, INTENTS.teacherAnalytics) ||
                detectIntent(message, INTENTS.institute) ||
                detectIntent(message, INTENTS.directory)
            ) {
                analyticsContext = await getTeacherAnalyticsContext(req.user);
                contextType = "staff";
            }
        } else if (detectIntent(message, INTENTS.performance)) {
            const rawData = await getComprehensiveAnalytics(userId);
            const allSubjects = Array.isArray(rawData?.allSubjects) ? rawData.allSubjects : [];
            const totalAccuracy = allSubjects.reduce((acc, curr) => acc + (Number(curr?.accuracy) || 0), 0);
            const overallAccuracy = allSubjects.length > 0
                ? Number((totalAccuracy / allSubjects.length).toFixed(1))
                : 0;

            // Token compression: pass only minimal fields.
            analyticsContext = {
                weakest: rawData?.weakestSubject?.subject || rawData?.weakestSubject?.name || null,
                strongest: rawData?.strongestSubject?.subject || rawData?.strongestSubject?.name || null,
                overallAccuracy,
            };
            contextType = "student";
        }

        // 3. Prompt Construction
        const { instruction, template } = getRoleConfiguration(userRole);
        const systemInstruction = analyticsContext
            ? `${instruction} Personalize your response using this JSON context: ${JSON.stringify(analyticsContext)}`
            : instruction;

        const chatHistory = history
            .slice(-COPILOT_HISTORY_LIMIT)
            .map((msg) => ((msg.role === "user" || msg.type === "human")
                ? new HumanMessage(msg.content)
                : new AIMessage(msg.content)));

        const messages = [
            new SystemMessage(systemInstruction),
            ...chatHistory,
            new HumanMessage(message),
        ];

        if (DEBUG_ENABLED) {
            console.log(`[Copilot] Invoking ${userRole} intent: ${contextType}`);
        }

        // 4. LLM Execution
        const { model, provider, modelName } = initializeLLM();
        const response = await model.invoke(messages);

        const reply = typeof response.content === "string"
            ? response.content.trim()
            : JSON.stringify(response.content).trim();

        // 5. Response
        return res.status(200).json({
            success: true,
            reply,
            ...(includeDebug && {
                debug: {
                    provider,
                    model: modelName,
                    role: userRole,
                    template,
                    contextType,
                    tokens: response?.usage_metadata || null,
                }
            })
        });
    } catch (error) {
        console.error("[Copilot Error Fatal]:", error);
        return res.status(500).json({ success: false, error: "AI failed to respond. Check server logs." });
    }
};
