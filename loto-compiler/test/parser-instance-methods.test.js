// parser-instance-methods.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parse } from '../src/parser.js';

describe('Parser Instance Methods', () => {
  it('should parse instance method calls in assignment context', () => {
    const source = `def test()
  result = @method()
end`;
    
    const ast = parse(source);
    const method = ast.body[0];
    const assignment = method.body[0];
    
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.value.kind, 'InstanceMethodCall');
    assert.strictEqual(assignment.value.variable, '@method');
    assert.strictEqual(assignment.value.arguments.length, 0);
  });

  it('should parse instance method calls with arguments in assignment', () => {
    const source = `def test()
  result = @calculate(10, "test")
end`;
    
    const ast = parse(source);
    const method = ast.body[0];
    const assignment = method.body[0];
    
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.value.kind, 'InstanceMethodCall');
    assert.strictEqual(assignment.value.variable, '@calculate');
    assert.strictEqual(assignment.value.arguments.length, 2);
    assert.strictEqual(assignment.value.arguments[0].kind, 'NumberLiteral');
    assert.strictEqual(assignment.value.arguments[1].kind, 'StringLiteral');
  });

  it('should parse instance method calls with complex arguments', () => {
    const source = `def test()
  result = @transform(@getValue(), 10)
end`;
    
    const ast = parse(source);
    const method = ast.body[0];
    const assignment = method.body[0];
    
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.value.kind, 'InstanceMethodCall');
    assert.strictEqual(assignment.value.variable, '@transform');
    assert.strictEqual(assignment.value.arguments.length, 2);
    assert.strictEqual(assignment.value.arguments[0].kind, 'InstanceMethodCall');
    assert.strictEqual(assignment.value.arguments[1].kind, 'NumberLiteral');
  });

  it('should parse nested instance method calls in assignment', () => {
    const source = `def test()
  result = @first(@second())
end`;
    
    const ast = parse(source);
    const method = ast.body[0];
    const assignment = method.body[0];
    
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.value.kind, 'InstanceMethodCall');
    assert.strictEqual(assignment.value.variable, '@first');
    assert.strictEqual(assignment.value.arguments.length, 1);
    assert.strictEqual(assignment.value.arguments[0].kind, 'InstanceMethodCall');
    assert.strictEqual(assignment.value.arguments[0].variable, '@second');
  });
});