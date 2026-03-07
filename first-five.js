
async function firstFive() {
    const key = "AIzaSyAFif2HmW9w_ZXBbHcN-mJlDHvHCo6iXEg";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("First 5 models:");
            data.models.slice(0, 5).forEach(m => console.log(`- ${m.name}`));
        }
    } catch (e) { console.error(e); }
}
firstFive();
