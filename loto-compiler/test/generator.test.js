// generator.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generate } from '../src/generator.js';

describe('Generator', () => {
  it('should generate JavaScript for simple function', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'FunctionDeclaration',
          name: 'main',
          returnType: null,
          parameters: [],
          body: [
            {
              kind: 'PrintStatement',
              value: 'Hello, world!'
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('function main() {'));
    assert.ok(jsCode.includes('print("Hello, world!");'));
    assert.ok(jsCode.includes('function print(value) {'));
    assert.ok(jsCode.includes('console.log(value);'));
    assert.ok(jsCode.includes('function defined(value) {'));
  });

  it('should generate JavaScript for function with type annotation', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'FunctionDeclaration',
          name: 'main',
          returnType: 'void',
          parameters: [],
          body: [
            {
              kind: 'PrintStatement',
              value: 'Hello, world!'
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    // Return type should not affect JavaScript generation at this stage
    assert.ok(jsCode.includes('function main() {'));
    assert.ok(jsCode.includes('print("Hello, world!");'));
  });

  it('should generate JavaScript for function call', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'CallExpression',
          name: 'main',
          arguments: []
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('main();'));
  });

  it('should generate complete hello world program', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'FunctionDeclaration',
          name: 'main',
          returnType: null,
          parameters: [],
          body: [
            {
              kind: 'PrintStatement',
              value: 'Hello, world!'
            }
          ]
        },
        {
          kind: 'CallExpression',
          name: 'main',
          arguments: []
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    // Should contain runtime helpers
    assert.ok(jsCode.includes('// ---- Loto → JavaScript ----'));
    assert.ok(jsCode.includes('function print(value) {'));
    assert.ok(jsCode.includes('function defined(value) {'));
    
    // Should contain function definition
    assert.ok(jsCode.includes('function main() {'));
    assert.ok(jsCode.includes('print("Hello, world!");'));
    
    // Should contain function call
    assert.ok(jsCode.includes('main();'));
  });

  it('should handle multiple print statements', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'FunctionDeclaration',
          name: 'test',
          returnType: null,
          parameters: [],
          body: [
            {
              kind: 'PrintStatement',
              value: 'First line'
            },
            {
              kind: 'PrintStatement',
              value: 'Second line'
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('print("First line");'));
    assert.ok(jsCode.includes('print("Second line");'));
  });

  it('should properly indent generated code', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'FunctionDeclaration',
          name: 'main',
          returnType: null,
          parameters: [],
          body: [
            {
              kind: 'PrintStatement',
              value: 'Hello!'
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    const lines = jsCode.split('\n');
    
    // Find the print statement line and check it's indented
    const printLine = lines.find(line => line.includes('print("Hello!");'));
    assert.ok(printLine.startsWith('  ')); // Should be indented with 2 spaces
  });
});