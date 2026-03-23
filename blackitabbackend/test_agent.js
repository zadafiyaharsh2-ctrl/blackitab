require('dotenv').config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { z } = require("zod");
const { HumanMessage } = require("@langchain/core/messages");

async function runTest() {
    try {
        const model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "gemini-pro", 
            temperature: 0.7,
        });

        const fetchWeaknessesTool = new DynamicStructuredTool({
            name: "fetch_student_weaknesses",
            description: "Fetches weaknesses",
            schema: z.object({
                trigger: z.string().optional()
            }),
            func: async () => {
                return "Mock student data";
            }
        });

        const tools = [fetchWeaknessesTool];
        const promptModifier = "You are a test agent.";

        const agent = createReactAgent({
            llm: model,
            tools,
            messageModifier: promptModifier, // test if this arg crashes it
        });

        const result = await agent.invoke({
            messages: [new HumanMessage("Hello")]
        });

        console.log("Success:", result);
    } catch (error) {
        console.error("Test Error Output:", error);
    }
}

runTest();
