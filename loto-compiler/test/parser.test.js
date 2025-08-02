// parser.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parse } from '../src/parser.js';

describe('Parser', () => {
  it('should parse simple function declaration without parentheses', () => {
    const source = `def main
  print "Hello, world!"
end`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 1);
    
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, null);
    assert.strictEqual(func.body.length, 1);
    
    const printStmt = func.body[0];
    assert.strictEqual(printStmt.kind, 'PrintStatement');
    assert.strictEqual(printStmt.value, 'Hello, world!');
  });

  it('should parse function declaration with parentheses and return type', () => {
    const source = `def main() : void
  print "Hello, world!"
end`;
    
    const ast = parse(source);
    
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, 'void');
    assert.strictEqual(func.body.length, 1);
  });

  it('should parse function call without parentheses', () => {
    const source = `def main
  print "Hello!"
end

main`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.body.length, 2);
    
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
    assert.strictEqual(call.arguments.length, 0);
  });

  it('should parse function call with parentheses', () => {
    const source = `def main
  print "Hello!"
end

main()`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.body.length, 2);
    
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
    assert.strictEqual(call.arguments.length, 0);
  });

  it('should parse complete hello world program', () => {
    const source = `# hello.loto
def main
  print "Hello, world!"
end

main()`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 2);
    
    // Function declaration
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, null);
    
    // Function call
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
  });

  it('should parse typed hello world program', () => {
    const source = `# hello_strict.loto
def main() : void
  print "Hello, world!"
end

main()`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 2);
    
    // Function declaration with type
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, 'void');
    
    // Function call
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
  });

  it('should handle empty programs', () => {
    const source = `# Just comments

# More comments`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 0);
  });

  it('should handle multiple statements in function body', () => {
    const source = `def test
  print "First line"
  print "Second line"
end`;
    
    const ast = parse(source);
    
    const func = ast.body[0];
    assert.strictEqual(func.body.length, 2);
    assert.strictEqual(func.body[0].kind, 'PrintStatement');
    assert.strictEqual(func.body[0].value, 'First line');
    assert.strictEqual(func.body[1].kind, 'PrintStatement');
    assert.strictEqual(func.body[1].value, 'Second line');
  });
});