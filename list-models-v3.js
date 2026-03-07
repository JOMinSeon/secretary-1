
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI("AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg");
    try {
        const models = await genAI.listModels();
        console.log("Found models:");
        models.models.forEach(m => console.log(m.name));
    } catch (err) {
        console.error("Error:", err);
    }
}
run();
