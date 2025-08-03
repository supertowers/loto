import { parse } from './src/parser.js';
import { readFileSync } from 'fs';

const source = readFileSync('../0003.example-components/counter.loto', 'utf8');
const ast = parse(source);

const component = ast.body[0];
const viewElement = component.renderBlock.elements[0];

console.log('View element children count:', viewElement.children.length);
console.log('Children:');
viewElement.children.forEach((child, i) => {
  console.log(`${i}: ${child.name} (${child.children?.length || 0} children)`);
  if (child.children) {
    child.children.forEach((grandchild, j) => {
      console.log(`  ${j}: ${JSON.stringify(grandchild)}`);
    });
  }
});