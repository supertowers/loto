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

  it('should generate JavaScript for class declarations', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'ClassDeclaration',
          name: 'User',
          properties: [
            { kind: 'PropertyDeclaration', name: 'name', type: 'string' }
          ],
          methods: [
            {
              kind: 'FunctionDeclaration',
              name: 'construct',
              parameters: [{ name: 'name', type: 'string' }],
              body: [
                {
                  kind: 'InstanceVarAssignment',
                  variable: '@name',
                  value: { kind: 'Identifier', name: 'name' }
                }
              ]
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('class User {'));
    assert.ok(jsCode.includes('constructor(name) {'));
    assert.ok(jsCode.includes('this.name = name;'));
  });

  it('should generate JavaScript for object instantiation', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'user',
          value: {
            kind: 'NewExpression',
            className: 'User',
            arguments: [
              { kind: 'StringLiteral', value: 'Pablo' }
            ]
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let user = new User("Pablo");'));
  });

  it('should generate JavaScript for property assignments', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'PropertyAssignment',
          object: 'user',
          properties: ['name'],
          value: { kind: 'StringLiteral', value: 'Pablo' }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('user.name = "Pablo";'));
  });

  it('should generate JavaScript for method calls', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'result',
          value: {
            kind: 'MethodCall',
            object: 'wallet',
            method: 'show',
            arguments: []
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let result = wallet.show();'));
  });

  it('should generate JavaScript for interpolated strings', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'message',
          value: {
            kind: 'InterpolatedString',
            value: 'Hello #{name}!'
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let message = `Hello ${name}!`;'));
  });

  it('should generate JavaScript for instance variable access', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'name',
          value: {
            kind: 'InstanceVar',
            name: '@name'
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let name = this.name;'));
  });

  it('should generate JavaScript for instance variable property access', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'ownerName',
          value: {
            kind: 'InstanceVarAccess',
            variable: '@owner',
            properties: ['name']
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let ownerName = this.owner.name;'));
  });

  it('should generate JavaScript for functions with parameters', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'FunctionDeclaration',
          name: 'format',
          parameters: [{ name: 'data', type: 'number' }],
          returnType: 'string',
          body: [
            {
              kind: 'ReturnStatement',
              value: {
                kind: 'InterpolatedString',
                value: '#{data} eur'
              }
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('function format(data) {'));
    assert.ok(jsCode.includes('return `${data} eur`;'));
  });

  it('should handle interpolated strings with instance variables', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'message',
          value: {
            kind: 'InterpolatedString',
            value: 'Balance: #{@balance}'
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let message = `Balance: ${this.balance}`;'));
  });

  it('should handle complex interpolated strings with function calls', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'Assignment',
          target: 'message',
          value: {
            kind: 'InterpolatedString',
            value: 'Wallet: {#{@owner.name}} - #{format(@balance)}'
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('let message = `Wallet: {${this.owner.name}} - ${format(this.balance)}`;'));
  });

  it('should generate complete class with methods', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'ClassDeclaration',
          name: 'Wallet',
          properties: [
            { kind: 'PropertyDeclaration', name: 'balance', type: 'number' }
          ],
          methods: [
            {
              kind: 'FunctionDeclaration',
              name: 'construct',
              parameters: [{ name: 'balance', type: 'number' }],
              body: [
                {
                  kind: 'InstanceVarAssignment',
                  variable: '@balance',
                  value: { kind: 'Identifier', name: 'balance' }
                }
              ]
            },
            {
              kind: 'FunctionDeclaration',
              name: 'print',
              parameters: [],
              returnType: 'string',
              body: [
                {
                  kind: 'ReturnStatement',
                  value: {
                    kind: 'InterpolatedString',
                    value: 'Balance: #{@balance}'
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    assert.ok(jsCode.includes('class Wallet {'));
    assert.ok(jsCode.includes('constructor(balance) {'));
    assert.ok(jsCode.includes('this.balance = balance;'));
    assert.ok(jsCode.includes('print() {'));
    assert.ok(jsCode.includes('return `Balance: ${this.balance}`;'));
  });

  it('should generate valid JavaScript object properties for CSS selectors', () => {
    const ast = {
      kind: 'Program',
      body: [
        {
          kind: 'ComponentDeclaration',
          name: 'TestComponent',
          props: [],
          state: [],
          methods: [],
          renderBlock: {
            kind: 'RenderBlock',
            elements: [
              {
                kind: 'JSXElement',
                name: 'View',
                className: 'container',
                attributes: [],
                children: []
              }
            ]
          },
          styleBlock: {
            kind: 'StyleBlock',
            rules: [
              {
                selector: '.container',
                declarations: [
                  {
                    property: 'backgroundColor',
                    value: { kind: 'StringLiteral', value: '#f0f0f0' }
                  },
                  {
                    property: 'padding',
                    value: { kind: 'NumberLiteral', value: '16' }
                  }
                ]
              },
              {
                selector: '.button-text',
                declarations: [
                  {
                    property: 'fontSize',
                    value: { kind: 'NumberLiteral', value: '14' }
                  }
                ]
              }
            ]
          }
        }
      ]
    };
    
    const jsCode = generate(ast);
    
    // Should convert CSS selectors to valid JavaScript property names
    assert.ok(jsCode.includes('container: {'));
    assert.ok(jsCode.includes('button-text: {'));
    assert.ok(jsCode.includes('backgroundColor: "#f0f0f0",'));
    assert.ok(jsCode.includes('padding: 16,'));
    assert.ok(jsCode.includes('fontSize: 14,'));
    
    // Should NOT include invalid CSS selector syntax
    assert.ok(!jsCode.includes('.container: {'));
    assert.ok(!jsCode.includes('.button-text: {'));
  });
});