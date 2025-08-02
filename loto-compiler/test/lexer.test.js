// lexer.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lex } from '../src/lexer.js';

describe('Lexer', () => {
  it('should tokenize simple function declaration', () => {
    const source = `def main
  print "Hello, world!"
end`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'keyword');
    assert.strictEqual(tokens[0].value, 'def');
    assert.strictEqual(tokens[1].kind, 'identifier');
    assert.strictEqual(tokens[1].value, 'main');
    assert.strictEqual(tokens[2].kind, 'newline');
    assert.strictEqual(tokens[3].kind, 'indent');
    assert.strictEqual(tokens[4].kind, 'keyword');
    assert.strictEqual(tokens[4].value, 'print');
    assert.strictEqual(tokens[5].kind, 'string');
    assert.strictEqual(tokens[5].value, 'Hello, world!');
    assert.strictEqual(tokens[6].kind, 'newline');
    assert.strictEqual(tokens[7].kind, 'dedent');
    assert.strictEqual(tokens[8].kind, 'keyword');
    assert.strictEqual(tokens[8].value, 'end');
  });

  it('should tokenize function with type annotation', () => {
    const source = `def main() : void
  print "Hello, world!"
end`;
    
    const tokens = lex(source);
    
    const relevantTokens = tokens.filter(t => t.kind !== 'newline' && t.kind !== 'indent' && t.kind !== 'dedent');
    
    assert.strictEqual(relevantTokens[0].kind, 'keyword');
    assert.strictEqual(relevantTokens[0].value, 'def');
    assert.strictEqual(relevantTokens[1].kind, 'identifier');
    assert.strictEqual(relevantTokens[1].value, 'main');
    assert.strictEqual(relevantTokens[2].kind, 'symbol');
    assert.strictEqual(relevantTokens[2].value, '(');
    assert.strictEqual(relevantTokens[3].kind, 'symbol');
    assert.strictEqual(relevantTokens[3].value, ')');
    assert.strictEqual(relevantTokens[4].kind, 'symbol');
    assert.strictEqual(relevantTokens[4].value, ':');
    assert.strictEqual(relevantTokens[5].kind, 'identifier');
    assert.strictEqual(relevantTokens[5].value, 'void');
  });

  it('should handle comments correctly', () => {
    const source = `# This is a comment
def main
  # Another comment
  print "Hello!"
end`;
    
    const tokens = lex(source);
    
    // Comments should be converted to newlines, not appear as tokens
    const commentTokens = tokens.filter(t => t.kind === 'comment');
    assert.strictEqual(commentTokens.length, 0);
    
    // Should still parse the actual code
    const codeTokens = tokens.filter(t => t.kind !== 'newline' && t.kind !== 'indent' && t.kind !== 'dedent');
    assert.strictEqual(codeTokens[0].value, 'def');
    assert.strictEqual(codeTokens[1].value, 'main');
    assert.strictEqual(codeTokens[2].value, 'print');
    assert.strictEqual(codeTokens[3].value, 'Hello!');
  });

  it('should tokenize function calls', () => {
    const source = `main()`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'identifier');
    assert.strictEqual(tokens[0].value, 'main');
    assert.strictEqual(tokens[1].kind, 'symbol');
    assert.strictEqual(tokens[1].value, '(');
    assert.strictEqual(tokens[2].kind, 'symbol');
    assert.strictEqual(tokens[2].value, ')');
    assert.strictEqual(tokens[3].kind, 'newline');
    assert.strictEqual(tokens[4].kind, 'eof');
  });

  it('should handle indentation correctly', () => {
    const source = `def outer
  def inner
    print "nested"
  end
end`;
    
    const tokens = lex(source);
    
    // Find indent/dedent tokens
    const indentTokens = tokens.filter(t => t.kind === 'indent' || t.kind === 'dedent');
    
    // Should have: indent (for outer), indent (for inner), dedent (for inner), dedent (for outer)
    assert.strictEqual(indentTokens.length, 4);
    assert.strictEqual(indentTokens[0].kind, 'indent');
    assert.strictEqual(indentTokens[1].kind, 'indent');
    assert.strictEqual(indentTokens[2].kind, 'dedent');
    assert.strictEqual(indentTokens[3].kind, 'dedent');
  });

  it('should tokenize class declarations', () => {
    const source = `class User
  name : string
end`;
    
    const tokens = lex(source);
    const codeTokens = tokens.filter(t => t.kind !== 'newline' && t.kind !== 'indent' && t.kind !== 'dedent');
    
    assert.strictEqual(codeTokens[0].kind, 'keyword');
    assert.strictEqual(codeTokens[0].value, 'class');
    assert.strictEqual(codeTokens[1].kind, 'identifier');
    assert.strictEqual(codeTokens[1].value, 'User');
    assert.strictEqual(codeTokens[2].kind, 'identifier');
    assert.strictEqual(codeTokens[2].value, 'name');
    assert.strictEqual(codeTokens[3].kind, 'symbol');
    assert.strictEqual(codeTokens[3].value, ':');
    assert.strictEqual(codeTokens[4].kind, 'identifier');
    assert.strictEqual(codeTokens[4].value, 'string');
  });

  it('should tokenize instance variables', () => {
    const source = `@name = "test"
@balance = 100`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'instance_var');
    assert.strictEqual(tokens[0].value, '@name');
    assert.strictEqual(tokens[1].kind, 'symbol');
    assert.strictEqual(tokens[1].value, '=');
    assert.strictEqual(tokens[2].kind, 'string');
    assert.strictEqual(tokens[2].value, 'test');
    
    assert.strictEqual(tokens[4].kind, 'instance_var');
    assert.strictEqual(tokens[4].value, '@balance');
    assert.strictEqual(tokens[5].kind, 'symbol');
    assert.strictEqual(tokens[5].value, '=');
    assert.strictEqual(tokens[6].kind, 'number');
    assert.strictEqual(tokens[6].value, '100');
  });

  it('should tokenize new keyword and object instantiation', () => {
    const source = `user = new User()`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'identifier');
    assert.strictEqual(tokens[0].value, 'user');
    assert.strictEqual(tokens[1].kind, 'symbol');
    assert.strictEqual(tokens[1].value, '=');
    assert.strictEqual(tokens[2].kind, 'keyword');
    assert.strictEqual(tokens[2].value, 'new');
    assert.strictEqual(tokens[3].kind, 'identifier');
    assert.strictEqual(tokens[3].value, 'User');
    assert.strictEqual(tokens[4].kind, 'symbol');
    assert.strictEqual(tokens[4].value, '(');
    assert.strictEqual(tokens[5].kind, 'symbol');
    assert.strictEqual(tokens[5].value, ')');
  });

  it('should tokenize interpolated strings', () => {
    const source = `"Hello #{name}"`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'interpolated_string');
    assert.strictEqual(tokens[0].value, 'Hello #{name}');
  });

  it('should distinguish regular strings from interpolated strings', () => {
    const source = `"Regular string"
"Interpolated #{variable}"`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'string');
    assert.strictEqual(tokens[0].value, 'Regular string');
    
    assert.strictEqual(tokens[2].kind, 'interpolated_string');
    assert.strictEqual(tokens[2].value, 'Interpolated #{variable}');
  });

  it('should tokenize property access and method calls', () => {
    const source = `user.name
wallet.show()`;
    
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'identifier');
    assert.strictEqual(tokens[0].value, 'user');
    assert.strictEqual(tokens[1].kind, 'symbol');
    assert.strictEqual(tokens[1].value, '.');
    assert.strictEqual(tokens[2].kind, 'identifier');
    assert.strictEqual(tokens[2].value, 'name');
    
    assert.strictEqual(tokens[4].kind, 'identifier');
    assert.strictEqual(tokens[4].value, 'wallet');
    assert.strictEqual(tokens[5].kind, 'symbol');
    assert.strictEqual(tokens[5].value, '.');
    assert.strictEqual(tokens[6].kind, 'identifier');
    assert.strictEqual(tokens[6].value, 'show');
    assert.strictEqual(tokens[7].kind, 'symbol');
    assert.strictEqual(tokens[7].value, '(');
    assert.strictEqual(tokens[8].kind, 'symbol');
    assert.strictEqual(tokens[8].value, ')');
  });

  it('should tokenize constructor methods', () => {
    const source = `def construct(name)
  @name = name
end`;
    
    const tokens = lex(source);
    const codeTokens = tokens.filter(t => t.kind !== 'newline' && t.kind !== 'indent' && t.kind !== 'dedent');
    
    assert.strictEqual(codeTokens[0].kind, 'keyword');
    assert.strictEqual(codeTokens[0].value, 'def');
    assert.strictEqual(codeTokens[1].kind, 'keyword');
    assert.strictEqual(codeTokens[1].value, 'construct');
    assert.strictEqual(codeTokens[2].kind, 'symbol');
    assert.strictEqual(codeTokens[2].value, '(');
    assert.strictEqual(codeTokens[3].kind, 'identifier');
    assert.strictEqual(codeTokens[3].value, 'name');
    assert.strictEqual(codeTokens[4].kind, 'symbol');
    assert.strictEqual(codeTokens[4].value, ')');
  });
});