// parser-jsx-content.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parse } from '../src/parser.js';

describe('Parser JSX Content', () => {
  it('should parse text with punctuation correctly', () => {
    const source = `component Test
  render
    Text Hello, world! How are you?
  end
end`;
    
    const ast = parse(source);
    const textElement = ast.body[0].renderBlock.elements[0];
    
    assert.strictEqual(textElement.children.length, 1);
    assert.strictEqual(textElement.children[0].kind, 'JSXText');
    assert.strictEqual(textElement.children[0].value, 'Hello , world ! How are you ?');
  });

  it('should parse mixed text and interpolation', () => {
    const source = `component Test
  render
    Text Welcome {{@name}}! Today is {{@date}}.
  end
end`;
    
    const ast = parse(source);
    const textElement = ast.body[0].renderBlock.elements[0];
    
    assert.strictEqual(textElement.children.length, 5);
    assert.strictEqual(textElement.children[0].kind, 'JSXText');
    assert.strictEqual(textElement.children[0].value, 'Welcome');
    assert.strictEqual(textElement.children[1].kind, 'JSXInterpolation');
    assert.strictEqual(textElement.children[1].value, '@name');
    assert.strictEqual(textElement.children[2].kind, 'JSXText');
    assert.strictEqual(textElement.children[2].value, '! Today is');
    assert.strictEqual(textElement.children[3].kind, 'JSXInterpolation');
    assert.strictEqual(textElement.children[3].value, '@date');
    assert.strictEqual(textElement.children[4].kind, 'JSXText');
    assert.strictEqual(textElement.children[4].value, '.');
  });

  it('should handle consecutive interpolations', () => {
    const source = `component Test
  render
    Text {{@first}}{{@second}}
  end
end`;
    
    const ast = parse(source);
    const textElement = ast.body[0].renderBlock.elements[0];
    
    assert.strictEqual(textElement.children.length, 2);
    assert.strictEqual(textElement.children[0].kind, 'JSXInterpolation');
    assert.strictEqual(textElement.children[1].kind, 'JSXInterpolation');
  });

  it('should handle empty text content', () => {
    const source = `component Test
  render
    Text
  end
end`;
    
    const ast = parse(source);
    const textElement = ast.body[0].renderBlock.elements[0];
    
    assert.strictEqual(textElement.children.length, 0);
  });

  it('should preserve spaces in content correctly', () => {
    const source = `component Test
  render
    Text Count : {{@value}} items
  end
end`;
    
    const ast = parse(source);
    const textElement = ast.body[0].renderBlock.elements[0];
    
    assert.strictEqual(textElement.children.length, 3);
    assert.strictEqual(textElement.children[0].value, 'Count :');
    assert.strictEqual(textElement.children[1].value, '@value');
    assert.strictEqual(textElement.children[2].value, 'items');
  });
});