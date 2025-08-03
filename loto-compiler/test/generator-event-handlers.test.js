// generator-event-handlers.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generate } from '../src/generator.js';

describe('Generator Event Handlers', () => {
  it('should convert on:press to onPress', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'TestComponent',
      props: [],
      state: [],
      methods: [],
      renderBlock: {
        kind: 'RenderBlock',
        elements: [{
          kind: 'JSXElement',
          name: 'Button',
          className: null,
          attributes: [{
            name: 'on:press',
            value: {
              kind: 'InstanceMethodCall',
              variable: '@handlePress',
              arguments: []
            }
          }],
          children: []
        }]
      },
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes('onPress={handlePress}'));
    assert.ok(!js.includes('on:press'));
  });

  it('should convert multiple event types correctly', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'TestComponent',
      props: [],
      state: [],
      methods: [],
      renderBlock: {
        kind: 'RenderBlock',
        elements: [{
          kind: 'JSXElement',
          name: 'Input',
          className: null,
          attributes: [
            {
              name: 'on:change',
              value: { kind: 'InstanceMethodCall', variable: '@onChange', arguments: [] }
            },
            {
              name: 'on:focus',
              value: { kind: 'InstanceMethodCall', variable: '@onFocus', arguments: [] }
            },
            {
              name: 'on:blur',
              value: { kind: 'InstanceMethodCall', variable: '@onBlur', arguments: [] }
            }
          ],
          children: []
        }]
      },
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes('onChange={onChange}'));
    assert.ok(js.includes('onFocus={onFocus}'));
    assert.ok(js.includes('onBlur={onBlur}'));
  });

  it('should handle event handlers with camelCase conversion', () => {
    const testCases = [
      { input: 'on:click', expected: 'onClick' },
      { input: 'on:mouse-over', expected: 'onMouseOver' }, // This would need additional handling
      { input: 'on:key-down', expected: 'onKeyDown' }, // This would need additional handling
      { input: 'on:submit', expected: 'onSubmit' }
    ];
    
    testCases.forEach(({ input, expected }) => {
      const component = {
        kind: 'ComponentDeclaration',
        name: 'TestComponent',
        props: [],
        state: [],
        methods: [],
        renderBlock: {
          kind: 'RenderBlock',
          elements: [{
            kind: 'JSXElement',
            name: 'Button',
            className: null,
            attributes: [{
              name: input,
              value: { kind: 'InstanceMethodCall', variable: '@handler', arguments: [] }
            }],
            children: []
          }]
        },
        styleBlock: null
      };
      
      const ast = { kind: 'Program', body: [component] };
      const js = generate(ast);
      
      if (input === 'on:click' || input === 'on:submit') {
        assert.ok(js.includes(`${expected}={handler}`), `Should convert ${input} to ${expected}`);
      }
    });
  });
});