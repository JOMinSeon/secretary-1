
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const key = "AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg";
    console.log("Using API Key:", key.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(key);
    try {
        console.log("Fetching models...");
        const result = await genAI.listModels();
        console.log("Available models:");
        result.models.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } catch (e) {
        console.error("Error listing models:");
        console.error(e);
        if (e.response) {
            console.error("Response:", await e.response.text());
        }
    }
}

listModels();
