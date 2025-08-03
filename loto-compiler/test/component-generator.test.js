// component-generator.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generate } from '../src/generator.js';

describe('Component Generator', () => {
  it('should generate basic React component with imports', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'SimpleComponent',
      props: [],
      state: [],
      methods: [],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes("import React from 'react';"));
    assert.ok(js.includes('function SimpleComponent({  }) {'));
    assert.ok(js.includes('return null;'));
    assert.ok(js.includes('export default SimpleComponent;'));
  });

  it('should generate React component with props and default values', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'Counter',
      props: [
        {
          kind: 'PropDeclaration',
          name: 'start',
          type: 'number',
          defaultValue: { kind: 'NumberLiteral', value: '0' }
        },
        {
          kind: 'PropDeclaration',
          name: 'label',
          type: 'string',
          defaultValue: { kind: 'StringLiteral', value: 'Click me' }
        }
      ],
      state: [],
      methods: [],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes('function Counter({ start = 0, label = "Click me" }) {'));
  });

  it('should generate React component with useState hooks', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'Counter',
      props: [
        {
          kind: 'PropDeclaration',
          name: 'start',
          type: 'number',
          defaultValue: { kind: 'NumberLiteral', value: '0' }
        }
      ],
      state: [
        {
          kind: 'StateDeclaration',
          name: 'count',
          type: 'number',
          initialValue: { kind: 'Identifier', name: 'start' }
        },
        {
          kind: 'StateDeclaration',
          name: 'active',
          type: 'boolean',
          initialValue: { kind: 'BooleanLiteral', value: true }
        }
      ],
      methods: [],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes('const [count, setCount] = useState(start);'));
    assert.ok(js.includes('const [active, setActive] = useState(true);'));
  });

  it('should generate correct React state setters for component methods', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'Counter',
      props: [],
      state: [
        {
          kind: 'StateDeclaration',
          name: 'count',
          type: 'number',
          initialValue: { kind: 'NumberLiteral', value: '0' }
        }
      ],
      methods: [
        {
          kind: 'FunctionDeclaration',
          name: 'increment',
          parameters: [],
          body: [
            {
              kind: 'InstanceVarAssignment',
              variable: '@count',
              value: {
                kind: 'BinaryExpression',
                left: { kind: 'InstanceVar', name: '@count' },
                operator: '+',
                right: { kind: 'NumberLiteral', value: '1' }
              }
            }
          ]
        }
      ],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    // Should generate React setter instead of this.count
    assert.ok(js.includes('setCount(count + 1);'));
    assert.ok(!js.includes('this.count'));
  });

  it('should handle non-state instance variables with this.variable', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'Component',
      props: [],
      state: [
        {
          kind: 'StateDeclaration',
          name: 'count',
          type: 'number',
          initialValue: { kind: 'NumberLiteral', value: '0' }
        }
      ],
      methods: [
        {
          kind: 'FunctionDeclaration',
          name: 'updateData',
          parameters: [],
          body: [
            {
              kind: 'InstanceVarAssignment',
              variable: '@data', // This is NOT in state
              value: { kind: 'StringLiteral', value: 'updated' }
            }
          ]
        }
      ],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    // Non-state variables should still use this.variable
    assert.ok(js.includes('this.data = "updated";'));
    assert.ok(!js.includes('setData'));
  });

  it('should generate arrow function methods', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'TestComponent',
      props: [],
      state: [],
      methods: [
        {
          kind: 'FunctionDeclaration',
          name: 'handleClick',
          parameters: [{ name: 'event', type: null }],
          body: [
            {
              kind: 'Assignment',
              target: 'result',
              value: { kind: 'StringLiteral', value: 'clicked' }
            }
          ]
        }
      ],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes('const handleClick = (event) => {'));
    assert.ok(js.includes('let result = "clicked";'));
    assert.ok(js.includes('};'));
  });
});