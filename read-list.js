
const fs = require('fs');
try {
    const content = fs.readFileSync('full-model-list.txt', 'utf8');
    console.log(content);
} catch (e) {
    console.error(e);
}
