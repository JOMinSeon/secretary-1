
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testV1() {
    const genAI = new GoogleGenerativeAI("AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg");
    try {
        console.log("Testing with apiVersion: 'v1'...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
        const result = await model.generateContent("Hi");
        console.log("Success with v1:", result.response.text());
    } catch (err) {
        console.error("Failed with v1:", err.message);

        try {
            console.log("Testing with apiVersion: 'v1beta' and model: 'gemini-1.5-flash-latest'...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }, { apiVersion: 'v1beta' });
            const result2 = await model2.generateContent("Hi");
            console.log("Success with v1beta + latest:", result2.response.text());
        } catch (err2) {
            console.error("Failed with v1beta + latest:", err2.message);
        }
    }
}
testV1();
