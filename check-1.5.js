
async function checkModel() {
    const key = "AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const found = data.models.some(m => m.name === "models/gemini-1.5-flash");
        const foundPro = data.models.some(m => m.name === "models/gemini-1.5-pro");
        console.log("Found gemini-1.5-flash:", found);
        console.log("Found gemini-1.5-pro:", foundPro);
        if (!found) {
            console.log("Other 1.5 models:");
            data.models.filter(m => m.name.includes("1.5")).forEach(m => console.log(`- ${m.name}`));
        }
    } catch (e) {
        console.error(e);
    }
}
checkModel();
