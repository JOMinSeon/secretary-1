
require("dotenv").config({ path: ".env.local" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    // Testing with gemini-1.5-flash-latest which is the recommended alias
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    try {
        console.log("Testing gemini-1.5-flash-latest...");
        const result = await model.generateContent("Hello, are you online? Answer shortly.");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (e) {
        console.error("Failed with gemini-1.5-flash-latest:");
        console.error(e.message);

        console.log("\nTrying generic gemini-1.5-flash as fallback...");
        try {
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result2 = await model2.generateContent("Hello?");
            console.log("Success with gemini-1.5-flash:", result2.response.text());
        } catch (e2) {
            console.error("Failed with gemini-1.5-flash too.");
            console.error(e2.message);
        }
    }
}

testModel();
