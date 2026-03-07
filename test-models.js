
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const models = await genAI.listModels();
        for (const model of models) {
            console.log(model.name);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
