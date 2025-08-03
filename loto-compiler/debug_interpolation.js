import { parse } from './src/parser.js';
import { generate } from './src/generator.js';
import { readFileSync } from 'fs';

try {
  const source = readFileSync('debug_interpolation.loto', 'utf8');
  console.log('Source:');
  console.log(source);
  
  const ast = parse(source);
  console.log('\n=== Text element children ===');
  const textElement = ast.body[0].renderBlock.elements[0];
  console.log('Children:', JSON.stringify(textElement.children, null, 2));
  
  console.log('\n=== Generated JS ===');
  const js = generate(ast);
  console.log(js);
  
  console.log('\n=== Contains expected? ===');
  console.log("Contains 'Welcome {message}!':", js.includes('Welcome {message}!'));
} catch (error) {
  console.error('Error:', error.message);
}