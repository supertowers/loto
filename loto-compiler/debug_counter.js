import { lex } from './src/lexer.js';
import { readFileSync } from 'fs';

const source = readFileSync('../0003.example-components/counter.loto', 'utf8');
console.log('Source:');
console.log(source);
console.log('\n=== TOKENS ===');

const tokens = lex(source);
tokens.forEach((token, i) => {
  console.log(`${i.toString().padStart(3)}: ${JSON.stringify(token)}`);
});