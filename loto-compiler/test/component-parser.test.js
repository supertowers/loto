// component-parser.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parse } from '../src/parser.js';

describe('Component Parser', () => {
  it('should parse component with empty props and state blocks', () => {
    const source = `component Test
  props
  end

  state
  end
end`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 1);
    
    const component = ast.body[0];
    assert.strictEqual(component.kind, 'ComponentDeclaration');
    assert.strictEqual(component.name, 'Test');
    assert.strictEqual(component.props.length, 0);
    assert.strictEqual(component.state.length, 0);
  });

  it('should parse component with props containing default values', () => {
    const source = `component Counter
  props
    start : number = 0
    label : string = "Click me"
  end
end`;
    
    const ast = parse(source);
    const component = ast.body[0];
    
    assert.strictEqual(component.props.length, 2);
    
    // Test first prop
    assert.strictEqual(component.props[0].kind, 'PropDeclaration');
    assert.strictEqual(component.props[0].name, 'start');
    assert.strictEqual(component.props[0].type, 'number');
    assert.strictEqual(component.props[0].defaultValue.kind, 'NumberLiteral');
    assert.strictEqual(component.props[0].defaultValue.value, '0');
    
    // Test second prop
    assert.strictEqual(component.props[1].kind, 'PropDeclaration');
    assert.strictEqual(component.props[1].name, 'label');
    assert.strictEqual(component.props[1].type, 'string');
    assert.strictEqual(component.props[1].defaultValue.kind, 'StringLiteral');
    assert.strictEqual(component.props[1].defaultValue.value, 'Click me');
  });

  it('should parse component with state initialized from props', () => {
    const source = `component Counter
  props
    start : number = 0
  end

  state
    count : number = start
    active : boolean = true
  end
end`;
    
    const ast = parse(source);
    const component = ast.body[0];
    
    assert.strictEqual(component.state.length, 2);
    
    // Test count state
    assert.strictEqual(component.state[0].kind, 'StateDeclaration');
    assert.strictEqual(component.state[0].name, 'count');
    assert.strictEqual(component.state[0].type, 'number');
    assert.strictEqual(component.state[0].initialValue.kind, 'Identifier');
    assert.strictEqual(component.state[0].initialValue.name, 'start');
    
    // Test active state
    assert.strictEqual(component.state[1].kind, 'StateDeclaration');
    assert.strictEqual(component.state[1].name, 'active');
    assert.strictEqual(component.state[1].type, 'boolean');
    assert.strictEqual(component.state[1].initialValue.kind, 'BooleanLiteral');
    assert.strictEqual(component.state[1].initialValue.value, true);
  });

  it('should parse component with methods that modify state', () => {
    const source = `component Counter
  state
    count : number = 0
  end

  def increment()
    @count = @count + 1
  end

  def reset()
    @count = 0
  end
end`;
    
    const ast = parse(source);
    const component = ast.body[0];
    
    assert.strictEqual(component.methods.length, 2);
    
    // Test increment method
    const incrementMethod = component.methods[0];
    assert.strictEqual(incrementMethod.kind, 'FunctionDeclaration');
    assert.strictEqual(incrementMethod.name, 'increment');
    assert.strictEqual(incrementMethod.parameters.length, 0);
    assert.strictEqual(incrementMethod.body.length, 1);
    
    const incrementBody = incrementMethod.body[0];
    assert.strictEqual(incrementBody.kind, 'InstanceVarAssignment');
    assert.strictEqual(incrementBody.variable, '@count');
    assert.strictEqual(incrementBody.value.kind, 'BinaryExpression');
    assert.strictEqual(incrementBody.value.operator, '+');
    
    // Test reset method
    const resetMethod = component.methods[1];
    assert.strictEqual(resetMethod.name, 'reset');
    assert.strictEqual(resetMethod.body[0].kind, 'InstanceVarAssignment');
    assert.strictEqual(resetMethod.body[0].variable, '@count');
    assert.strictEqual(resetMethod.body[0].value.kind, 'NumberLiteral');
    assert.strictEqual(resetMethod.body[0].value.value, '0');
  });

  it('should handle components with mixed prop/state/method order', () => {
    const source = `component Mixed
  def init()
    @ready = true
  end

  props
    enabled : boolean = false
  end

  state
    ready : boolean = false
  end

  def toggle()
    @ready = @ready
  end
end`;
    
    const ast = parse(source);
    const component = ast.body[0];
    
    assert.strictEqual(component.kind, 'ComponentDeclaration');
    assert.strictEqual(component.props.length, 1);
    assert.strictEqual(component.state.length, 1);
    assert.strictEqual(component.methods.length, 2);
    
    // Verify the methods are in the order they appear
    assert.strictEqual(component.methods[0].name, 'init');
    assert.strictEqual(component.methods[1].name, 'toggle');
  });
});