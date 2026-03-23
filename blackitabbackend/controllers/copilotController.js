const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { z } = require("zod");
const { HumanMessage } = require("@langchain/core/messages");

// Import the aggregation from step 1
const { fetchStudentWeaknessesAggregation } = require("./analyticsController");

exports.generateCopilotResponse = async (req, res) => {
    try {
        const { message } = req.body;
        // 1. THE CATASTROPHIC FLAW FIX: 
        // We rip out the body-parsed user ID and strictly rely on the trusted JWT token.
        const userId = req.user._id || req.user.id; 

        if (!userId || !message) {
            return res.status(400).json({ success: false, error: "Token unauthenticated or message missing." });
        }

        // Initialize Model (Using Google Gemini)
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash", 
            temperature: 0.7,
        });

        // Define the Tool securely binding the user's ID
        const fetchWeaknessesTool = new DynamicStructuredTool({
            name: "fetch_student_weaknesses",
            description: "Fetches the current student's lowest accuracy subjects/topics and the days since they last practiced them. Call this anytime the user asks what to study or review.",
            schema: z.object({
                trigger: z.string().optional().describe("Just pass 'execute'")
            }),
            func: async () => {
                const data = await fetchStudentWeaknessesAggregation(userId);
                
                if (!data || data.length === 0) {
                    return "The student hasn't completed enough quizzes yet to generate an accuracy report.";
                }
                return JSON.stringify(data);
            }
        });

        const tools = [fetchWeaknessesTool];

        const promptModifier = `You are the Ranklen Copilot, an elite AI tutor. 
When a user asks what to study, you MUST use the fetch_student_weaknesses tool to get their historical data. 
Review their lowest accuracy subjects and the days since their last attempt (to account for memory decay). 
Recommend a specific topic to study in a brief, direct, and gamified tone. Do not write a long essay. Suggest one immediate action.`;

        // 2. THE SYNTAX FLAW FIX: 
        // We UPGRADE to createReactAgent from @langchain/langgraph since createToolCallingAgent is deprecated and moved in LangChain v0.3+.
        const agent = createReactAgent({
            llm: model,
            tools,
            messageModifier: promptModifier,
        });

        // Execute
        const result = await agent.invoke({
            messages: [new HumanMessage(message)],
        });

        const reply = result.messages[result.messages.length - 1].content;

        return res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        // 3. THE SWALLOWED ERROR FIX: 
        // We log the critical execution error to standard output so developers aren't blind against rate-limiting or JSON parsing failures.
        console.error("[Copilot Error]:", error); 
        return res.status(500).json({ success: false, error: "AI failed to respond." });
    }
};
