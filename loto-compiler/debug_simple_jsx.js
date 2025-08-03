import { parse } from './src/parser.js';
import { readFileSync } from 'fs';

try {
  const source = readFileSync('debug_simple_jsx.loto', 'utf8');
  console.log('Source:');
  console.log(source);
  console.log('\n=== AST ===');
  const ast = parse(source);
  console.log(JSON.stringify(ast, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}