
async function listModelsRest() {
    const key = "AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Total Models:", data.models.length);
            data.models.slice(0, 20).forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found. Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
listModelsRest();
