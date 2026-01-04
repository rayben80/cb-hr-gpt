const fs = require('fs');

const content = fs.readFileSync('d:/cb-hr-gpt/src/constants/mockData.ts', 'utf8');

const lines = content.split('\n');
let currentMember = {};

lines.forEach((line) => {
    if (line.includes("name: '")) {
        const nameMatch = line.match(/name: '([^']*)'/);
        if (nameMatch) {
            currentMember = { name: nameMatch[1] };
        }
    }
    if (line.includes("employmentType: '")) {
        const typeMatch = line.match(/employmentType: '([^']*)'/);
        if (typeMatch) {
            currentMember.employmentType = typeMatch[1];
            console.log(`Found member: ${currentMember.name}, Type: ${currentMember.employmentType}`);
        }
    }
});
