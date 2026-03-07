
require("dotenv").config({ path: ".env.local" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    try {
        console.log("Listing models...");
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels ? await genAI.listModels() : await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
        // Wait, listModels is on the genAI object usually in newer SDKs, or on the model object?
        // Actually genAI.listModels() is correct for @google/generative-ai
        const modelsResult = await genAI.listModels();
        console.log("Available models:");
        for (const model of modelsResult.models) {
            console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods.join(', ')})`);
        }
    } catch (e) {
        console.error("Error listing models:", e.message);
        if (e.response) {
            try {
                const text = await e.response.text();
                console.error("Full response:", text);
            } catch (err) { }
        }
    }
}

listModels();
