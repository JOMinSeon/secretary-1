
async function findFlash() {
    const key = "AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            const matches = data.models.filter(m => m.name.includes("flash"));
            console.log("Matching models:");
            matches.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found.");
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
findFlash();
