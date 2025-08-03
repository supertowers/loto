import { parse } from './src/parser.js';
import { generate } from './src/generator.js';
import { readFileSync } from 'fs';

try {
  const source = readFileSync('debug_complex.loto', 'utf8');
  console.log('Source:');
  console.log(source);
  console.log('\n=== AST ===');
  const ast = parse(source);
  console.log(JSON.stringify(ast, null, 2));
  console.log('\n=== JS ===');
  const js = generate(ast);
  console.log(js);
} catch (error) {
  console.error('Error:', error.message);
}