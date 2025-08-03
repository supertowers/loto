// component-integration.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parse } from '../src/parser.js';
import { generate } from '../src/generator.js';
import { readFileSync } from 'fs';

describe('Component Integration Tests', () => {
  it('should parse and generate the complete counter.loto component', () => {
    const source = readFileSync('../0003.example-components/counter.loto', 'utf8');
    
    // Parse the component
    const ast = parse(source);
    
    // Verify the AST structure
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 1);
    
    const component = ast.body[0];
    assert.strictEqual(component.kind, 'ComponentDeclaration');
    assert.strictEqual(component.name, 'Counter');
    
    // Verify props
    assert.strictEqual(component.props.length, 1);
    assert.strictEqual(component.props[0].name, 'start');
    assert.strictEqual(component.props[0].type, 'number');
    assert.strictEqual(component.props[0].defaultValue.value, '0');
    
    // Verify state
    assert.strictEqual(component.state.length, 1);
    assert.strictEqual(component.state[0].name, 'count');
    assert.strictEqual(component.state[0].type, 'number');
    assert.strictEqual(component.state[0].initialValue.name, 'start');
    
    // Verify methods
    assert.strictEqual(component.methods.length, 1);
    assert.strictEqual(component.methods[0].name, 'increment');
    
    // Verify render block
    assert.ok(component.renderBlock);
    assert.strictEqual(component.renderBlock.kind, 'RenderBlock');
    assert.strictEqual(component.renderBlock.elements.length, 1);
    
    const viewElement = component.renderBlock.elements[0];
    assert.strictEqual(viewElement.kind, 'JSXElement');
    assert.strictEqual(viewElement.name, 'View');
    assert.strictEqual(viewElement.className, 'counter');
    
    // Verify nested elements
    assert.strictEqual(viewElement.children.length, 2); // Text and Pressable
    
    const textElement = viewElement.children[0];
    assert.strictEqual(textElement.name, 'Text');
    assert.strictEqual(textElement.attributes[0].name, 'class');
    assert.strictEqual(textElement.children.length, 2); // "Count: " and {{@count}}
    
    const pressableElement = viewElement.children[1];
    assert.strictEqual(pressableElement.name, 'Pressable');
    assert.strictEqual(pressableElement.attributes[0].name, 'on:press');
    assert.strictEqual(pressableElement.attributes[0].value.kind, 'InstanceMethodCall');
    
    // Verify style block
    assert.ok(component.styleBlock);
    assert.strictEqual(component.styleBlock.rules.length, 3);
    
    // Generate JavaScript
    const js = generate(ast);
    
    // Verify React component structure
    assert.ok(js.includes("import React, { useState } from 'react';"));
    assert.ok(js.includes('function Counter({ start = 0 }) {'));
    assert.ok(js.includes('const [count, setCount] = useState(start);'));
    assert.ok(js.includes('const increment = () => {'));
    assert.ok(js.includes('setCount(count + 1);'));
    
    // Verify JSX generation
    assert.ok(js.includes('<View className="counter">'));
    assert.ok(js.includes('<Text className="label">Count :{count}</Text>'));
    assert.ok(js.includes('<Pressable onPress={increment}>'));
    assert.ok(js.includes('<Text className="buttonText">+</Text>'));
    
    // Verify styles generation
    assert.ok(js.includes('const styles = {'));
    assert.ok(js.includes('counter: {'));
    assert.ok(js.includes('backgroundColor: "#f4f4f4",'));
    assert.ok(js.includes('export default Counter;'));
  });

  it('should handle event handler syntax correctly', () => {
    const source = `component TestComponent
  render
    Button(on:click=@handleClick())
      Text Click me
  end
end`;

    const ast = parse(source);
    const js = generate(ast);
    
    // Verify event handler conversion
    assert.ok(js.includes('onClick={handleClick}'));
    assert.ok(!js.includes('on:click'));
    assert.ok(!js.includes('this.handleClick'));
  });

  it('should handle multiple event types correctly', () => {
    const source = `component TestComponent
  render
    Input(on:change=@onChange() on:focus=@onFocus())
  end
end`;

    const ast = parse(source);
    const js = generate(ast);
    
    // Verify multiple event handlers
    assert.ok(js.includes('onChange={onChange}'));
    assert.ok(js.includes('onFocus={onFocus}'));
  });

  it('should handle JSX interpolation with instance variables', () => {
    const source = `component TestComponent
  state
    message : string = "Hello"
  end
  
  render
    Text Welcome {{@message}}!
  end
end`;

    const ast = parse(source);
    const js = generate(ast);
    
    // Verify interpolation conversion
    assert.ok(js.includes('Welcome{message}!'));
    assert.ok(!js.includes('{{@message}}'));
  });

  it('should handle complex nested JSX structure', () => {
    const source = `component TestComponent
  render
    View.container
      Header.main
        Title Welcome
      Content.body
        Text(class="description") This is content
        Button(on:press=@action())
          Text Press me
  end
end`;

    const ast = parse(source);
    const js = generate(ast);
    
    // Verify nested structure
    assert.ok(js.includes('<View className="container">'));
    assert.ok(js.includes('<Header className="main">'));
    assert.ok(js.includes('<Title>Welcome</Title>'));
    assert.ok(js.includes('<Content className="body">'));
    assert.ok(js.includes('<Text className="description">This is content</Text>'));
    assert.ok(js.includes('<Button onPress={action}>'));
  });

  it('should handle empty props and state blocks', () => {
    const source = `component EmptyComponent
  props
  end
  
  state
  end
  
  render
    Text Empty component
  end
end`;

    const ast = parse(source);
    const component = ast.body[0];
    
    assert.strictEqual(component.props.length, 0);
    assert.strictEqual(component.state.length, 0);
    
    const js = generate(ast);
    assert.ok(js.includes('function EmptyComponent({  }) {')); // Empty props
    assert.ok(!js.includes('useState')); // No state
  });

  it('should generate correct React hooks for state', () => {
    const source = `component StatefulComponent
  state
    count : number = 0
    active : boolean = true
    message : string = "hello"
  end
end`;

    const ast = parse(source);
    const js = generate(ast);
    
    // Verify state hooks
    assert.ok(js.includes('const [count, setCount] = useState(0);'));
    assert.ok(js.includes('const [active, setActive] = useState(true);'));
    assert.ok(js.includes('const [message, setMessage] = useState("hello");'));
  });
});