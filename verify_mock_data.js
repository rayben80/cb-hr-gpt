const fs = require('fs');

const content = fs.readFileSync('d:/cb-hr-gpt/src/constants/mockData.ts', 'utf8');

// Extract all members with name and employmentType
const matches = [];
const regex = /name:\s*'([^']*)'[\s\S]*?employmentType:\s*'([^']*)'/g;
// Note: This regex is simple and might miss if order is different, but let's try.
// Better: split by 'id:' and process each block?

const lines = content.split('\n');
let currentMember = {};

lines.forEach((line) => {
    if (line.includes("name: '")) {
        const name = line.match(/name: '([^']*)'/)[1];
        currentMember = { name };
    }
    if (line.includes("employmentType: '")) {
        currentMember.employmentType = line.match(/employmentType: '([^']*)'/)[1];
        console.log(`Found member: ${currentMember.name}, Type: ${currentMember.employmentType}`);
    }
});
