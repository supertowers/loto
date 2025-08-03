// generator-conditional-imports.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generate } from '../src/generator.js';

describe('Generator Conditional Imports', () => {
  it('should import useState when component has state', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'StatefulComponent',
      props: [],
      state: [{
        kind: 'StateDeclaration',
        name: 'count',
        type: 'number',
        initialValue: { kind: 'NumberLiteral', value: '0' }
      }],
      methods: [],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes("import React, { useState } from 'react';"));
    assert.ok(!js.includes("import React from 'react';"));
  });

  it('should not import useState when component has no state', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'StatelessComponent',
      props: [],
      state: [],
      methods: [],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes("import React from 'react';"));
    assert.ok(!js.includes("import React, { useState } from 'react';"));
  });

  it('should import useState when component has multiple state variables', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'MultiStateComponent',
      props: [],
      state: [
        {
          kind: 'StateDeclaration',
          name: 'count',
          type: 'number',
          initialValue: { kind: 'NumberLiteral', value: '0' }
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
    
    assert.ok(js.includes("import React, { useState } from 'react';"));
    assert.ok(js.includes('const [count, setCount] = useState(0);'));
    assert.ok(js.includes('const [active, setActive] = useState(true);'));
  });

  it('should handle empty state array correctly', () => {
    const component = {
      kind: 'ComponentDeclaration',
      name: 'EmptyStateComponent',
      props: [],
      state: [], // Explicitly empty array
      methods: [],
      renderBlock: null,
      styleBlock: null
    };
    
    const ast = { kind: 'Program', body: [component] };
    const js = generate(ast);
    
    assert.ok(js.includes("import React from 'react';"));
    assert.ok(!js.includes('useState'));
  });
});