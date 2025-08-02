// parser.js
// Loto parser - converts tokens into Abstract Syntax Tree (AST)

import { lex } from './lexer.js';

export function parse(source) {
  const tokens = lex(source);
  let position = 0;
  
  const peek = () => tokens[position];
  const next = () => tokens[position++];
  const isAtEnd = () => position >= tokens.length || peek().kind === 'eof';
  
  function expect(kind, value = null) {
    const token = next();
    if (token.kind !== kind || (value && token.value !== value)) {
      throw new Error(`Expected ${kind}${value ? ` "${value}"` : ''} but got ${JSON.stringify(token)}`);
    }
    return token;
  }
  
  function skipNewlines() {
    while (peek().kind === 'newline') {
      next();
    }
  }
  
  function parseProgram() {
    const statements = [];
    skipNewlines();
    
    while (!isAtEnd()) {
      const stmt = parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      skipNewlines();
    }
    
    return {
      kind: 'Program',
      body: statements
    };
  }
  
  function parseStatement() {
    skipNewlines();
    
    if (isAtEnd()) return null;
    
    const token = peek();
    
    if (token.kind === 'keyword') {
      switch (token.value) {
        case 'def':
          return parseFunctionDeclaration();
        case 'print':
          return parsePrintStatement();
        case 'return':
          return parseReturnStatement();
        default:
          throw new Error(`Unexpected keyword: ${token.value}`);
      }
    }
    
    if (token.kind === 'identifier') {
      return parseCallExpression();
    }
    
    // Skip tokens we don't handle yet
    if (token.kind === 'indent' || token.kind === 'dedent' || token.kind === 'newline') {
      next();
      return null;
    }
    
    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }
  
  function parseFunctionDeclaration() {
    expect('keyword', 'def');
    const name = expect('identifier').value;
    
    // Check if there are parentheses for parameters
    if (peek().kind === 'symbol' && peek().value === '(') {
      expect('symbol', '(');
      expect('symbol', ')');
    }
    
    let returnType = null;
    if (peek().kind === 'symbol' && peek().value === ':') {
      next(); // consume ':'
      returnType = expect('identifier').value;
    }
    
    expect('newline');
    expect('indent');
    
    const body = [];
    while (peek().kind !== 'keyword' || peek().value !== 'end') {
      const stmt = parseStatement();
      if (stmt) {
        body.push(stmt);
      }
    }
    
    expect('keyword', 'end');
    expect('newline');
    
    // Only expect dedent if there actually is one
    if (peek().kind === 'dedent') {
      expect('dedent');
    }
    
    return {
      kind: 'FunctionDeclaration',
      name,
      returnType,
      parameters: [], // TODO: add parameter parsing
      body
    };
  }
  
  function parsePrintStatement() {
    expect('keyword', 'print');
    const value = expect('string').value;
    expect('newline');
    
    return {
      kind: 'PrintStatement',
      value
    };
  }
  
  function parseReturnStatement() {
    expect('keyword', 'return');
    // TODO: add expression parsing for return values
    expect('newline');
    
    return {
      kind: 'ReturnStatement',
      value: null
    };
  }
  
  function parseCallExpression() {
    const name = expect('identifier').value;
    
    // Check if there are parentheses
    if (peek().kind === 'symbol' && peek().value === '(') {
      expect('symbol', '(');
      expect('symbol', ')');
    }
    
    expect('newline');
    
    return {
      kind: 'CallExpression',
      name,
      arguments: [] // TODO: add argument parsing
    };
  }
  
  return parseProgram();
}