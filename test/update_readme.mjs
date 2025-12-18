import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'test_results.json');
const readmePath = path.join(__dirname, 'README.md');

const results = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let examples = 'Exemples complets (toutes les questions et réponses)\n\n';

for (const test of results) {
  examples += `- **${test.test}**\n`;
  examples += `  - Question : ${test.question}\n`;
  examples += `  - Réponse :\n\n`;
  // Indent the reply properly (4 spaces per line)
  const indentedReply = test.reply.split('\n').map(line => '    ' + line).join('\n');
  examples += indentedReply + '\n';
  examples += `  - Status : ${test.status}\n\n`;
}

const readme = fs.readFileSync(readmePath, 'utf8');

const startMarker = 'Exemples complets (toutes les questions et réponses)';
const endMarker = '**Résultats actuels**';

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

console.log('startIndex:', startIndex);
console.log('endIndex:', endIndex);
console.log('startMarker length:', startMarker.length);
console.log('readme length:', readme.length);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found in README.md');
  process.exit(1);
}

const before = readme.substring(0, startIndex);
const after = readme.substring(endIndex);

const newReadme = before + examples + after;

fs.writeFileSync(readmePath, newReadme);

console.log('README.md updated successfully with new AI responses.');