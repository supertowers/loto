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
  
  function parseStatement(inFunctionBody = false) {
    skipNewlines();
    
    if (isAtEnd()) return null;
    
    const token = peek();
    
    if (token.kind === 'keyword') {
      switch (token.value) {
        case 'def':
          return parseFunctionDeclaration();
        case 'class':
          return parseClassDeclaration();
        case 'print':
          return parsePrintStatement();
        case 'return':
          return parseReturnStatement();
        case 'end':
          // This will be handled by the calling context (class or function)
          return null;
        default:
          throw new Error(`Unexpected keyword: ${token.value}`);
      }
    }
    
    if (token.kind === 'identifier') {
      // Look ahead to see what type of statement this is
      const nextToken = tokens[position + 1];
      if (nextToken && nextToken.kind === 'symbol') {
        if (nextToken.value === '=') {
          return parseAssignment();
        }
        if (nextToken.value === '.') {
          return parsePropertyAccess();
        }
        if (nextToken.value === '(') {
          return parseCallExpression();
        }
      }
      
      // Handle different contexts
      if (inFunctionBody) {
        // In function body: parse as expression (handles arithmetic, etc.) and wrap in ReturnStatement
        const expr = parseExpression();
        expect('newline');
        return {
          kind: 'ReturnStatement',
          value: expr
        };
      } else {
        // At top level: treat as function call without parentheses
        return parseCallExpression();
      }
    }
    
    if (token.kind === 'instance_var') {
      // Instance variable assignment
      const nextToken = tokens[position + 1];
      if (nextToken && nextToken.kind === 'symbol' && nextToken.value === '=') {
        return parseInstanceVarAssignment();
      }
    }
    
    if (token.kind === 'interpolated_string' || token.kind === 'string') {
      // Standalone string/interpolated string (implicit return)
      const expr = parseExpression();
      expect('newline');
      return {
        kind: 'ReturnStatement',
        value: expr
      };
    }
    
    
    // Skip tokens we don't handle yet
    if (token.kind === 'indent' || token.kind === 'dedent' || token.kind === 'newline') {
      next();
      return null;
    }
    
    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }
  
  function parseInstanceVarAssignment() {
    const varName = expect('instance_var').value;
    expect('symbol', '=');
    const value = parseExpression();
    expect('newline');
    
    return {
      kind: 'InstanceVarAssignment',
      variable: varName,
      value
    };
  }
  
  function parseFunctionDeclaration() {
    expect('keyword', 'def');
    
    // Handle special function names that are also keywords
    let name;
    if (peek().kind === 'keyword' && (peek().value === 'construct' || peek().value === 'print')) {
      name = next().value;
    } else {
      name = expect('identifier').value;
    }
    
    // Parse parameters
    const parameters = [];
    if (peek().kind === 'symbol' && peek().value === '(') {
      expect('symbol', '(');
      
      while (peek().kind !== 'symbol' || peek().value !== ')') {
        const paramName = expect('identifier').value;
        let paramType = null;
        
        if (peek().kind === 'symbol' && peek().value === ':') {
          expect('symbol', ':');
          paramType = expect('identifier').value;
        }
        
        parameters.push({ name: paramName, type: paramType });
        
        if (peek().kind === 'symbol' && peek().value === ',') {
          expect('symbol', ',');
        }
      }
      
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
      const stmt = parseStatement(true); // inFunctionBody = true
      if (stmt) {
        body.push(stmt);
      }
    }
    
    // Handle implicit return for single expression functions
    if (body.length === 1 && body[0].kind !== 'ReturnStatement' && body[0].kind !== 'PrintStatement' && 
        body[0].kind !== 'Assignment' && body[0].kind !== 'InstanceVarAssignment') {
      // If it's a single expression, wrap it in a return statement
      if (body[0].kind === 'CallExpression' || body[0].kind === 'StringLiteral' || body[0].kind === 'InterpolatedString') {
        body[0] = {
          kind: 'ReturnStatement',
          value: body[0]
        };
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
      parameters,
      body
    };
  }
  
  function parsePrintStatement() {
    expect('keyword', 'print');
    
    // Handle both string literals and expressions
    let value;
    if (peek().kind === 'string') {
      value = expect('string').value;
    } else {
      // Parse as expression (could be variable, function call, etc.)
      value = parseExpression();
    }
    
    expect('newline');
    
    return {
      kind: 'PrintStatement',
      value
    };
  }
  
  function parseReturnStatement() {
    expect('keyword', 'return');
    
    // Check if there's a return value
    let value = null;
    if (peek().kind !== 'newline') {
      value = parseExpression();
    }
    
    expect('newline');
    
    return {
      kind: 'ReturnStatement',
      value
    };
  }
  
  function parseCallExpression() {
    const name = expect('identifier').value;
    
    const args = [];
    
    // Check if there are parentheses
    if (peek().kind === 'symbol' && peek().value === '(') {
      expect('symbol', '(');
      
      // Parse arguments
      while (peek().kind !== 'symbol' || peek().value !== ')') {
        args.push(parseExpression());
        
        // Handle comma-separated arguments
        if (peek().kind === 'symbol' && peek().value === ',') {
          expect('symbol', ',');
        } else if (peek().kind !== 'symbol' || peek().value !== ')') {
          throw new Error(`Expected ',' or ')' in function call`);
        }
      }
      
      expect('symbol', ')');
    }
    
    expect('newline');
    
    return {
      kind: 'CallExpression',
      name,
      arguments: args
    };
  }
  
  function parseClassDeclaration() {
    expect('keyword', 'class');
    const name = expect('identifier').value;
    expect('newline');
    expect('indent');
    
    const properties = [];
    const methods = [];
    
    while (peek().kind !== 'dedent' && !isAtEnd()) {
      skipNewlines();
      if (peek().kind === 'dedent' || isAtEnd()) break;
      
      // Check if this is a property declaration (identifier : type)
      if (peek().kind === 'identifier') {
        const nextToken = tokens[position + 1];
        if (nextToken && nextToken.kind === 'symbol' && nextToken.value === ':') {
          const propName = expect('identifier').value;
          expect('symbol', ':');
          const propType = expect('identifier').value;
          expect('newline');
          
          properties.push({
            kind: 'PropertyDeclaration',
            name: propName,
            type: propType
          });
          continue;
        }
      }
      
      // Check if we hit the end of the class
      if (peek().kind === 'keyword' && peek().value === 'def') {
        const stmt = parseStatement();
        if (stmt && stmt.kind === 'FunctionDeclaration') {
          methods.push(stmt);
        }
      } else {
        break; // Exit if we don't find a method
      }
    }
    
    // Only expect dedent if there actually is one
    if (peek().kind === 'dedent') {
      expect('dedent');
    }
    
    expect('keyword', 'end');
    expect('newline');
    
    return {
      kind: 'ClassDeclaration',
      name,
      properties,
      methods
    };
  }
  
  function parseAssignment() {
    const target = expect('identifier').value;
    expect('symbol', '=');
    const value = parseExpression();
    expect('newline');
    
    return {
      kind: 'Assignment',
      target,
      value
    };
  }
  
  function parsePropertyAccess() {
    const object = expect('identifier').value;
    
    const properties = [];
    while (peek().kind === 'symbol' && peek().value === '.') {
      expect('symbol', '.');
      properties.push(expect('identifier').value);
    }
    
    // Check if this is a property assignment
    if (peek().kind === 'symbol' && peek().value === '=') {
      expect('symbol', '=');
      const value = parseExpression();
      expect('newline');
      
      return {
        kind: 'PropertyAssignment',
        object,
        properties,
        value
      };
    }
    
    // Check if this is a method call
    if (peek().kind === 'symbol' && peek().value === '(') {
      expect('symbol', '(');
      
      const args = [];
      while (peek().kind !== 'symbol' || peek().value !== ')') {
        args.push(parseExpression());
        
        // Handle comma-separated arguments
        if (peek().kind === 'symbol' && peek().value === ',') {
          expect('symbol', ',');
        } else if (peek().kind !== 'symbol' || peek().value !== ')') {
          throw new Error(`Expected ',' or ')' in method call`);
        }
      }
      
      expect('symbol', ')');
      expect('newline');
      
      return {
        kind: 'MethodCall',
        object,
        method: properties[properties.length - 1], // Last property is the method name
        arguments: args
      };
    }
    
    expect('newline');
    return {
      kind: 'PropertyAccess',
      object,
      properties
    };
  }
  
  function parseExpression() {
    const token = peek();
    
    if (token.kind === 'keyword' && token.value === 'new') {
      return parseNewExpression();
    }
    
    if (token.kind === 'string') {
      return {
        kind: 'StringLiteral',
        value: next().value
      };
    }
    
    if (token.kind === 'interpolated_string') {
      return {
        kind: 'InterpolatedString',
        value: next().value
      };
    }
    
    if (token.kind === 'number') {
      return {
        kind: 'NumberLiteral',
        value: next().value
      };
    }
    
    if (token.kind === 'identifier') {
      const name = next().value;
      
      // Check for property access first
      if (peek().kind === 'symbol' && peek().value === '.') {
        const properties = [name];
        while (peek().kind === 'symbol' && peek().value === '.') {
          next(); // consume '.'
          const propName = expect('identifier').value;
          properties.push(propName);
          
          // Check if this property is a method call
          if (peek().kind === 'symbol' && peek().value === '(') {
            next(); // consume '('
            
            const args = [];
            while (peek().kind !== 'symbol' || peek().value !== ')') {
              args.push(parseExpression());
              if (peek().kind === 'symbol' && peek().value === ',') {
                next(); // consume comma
              }
            }
            
            expect('symbol', ')');
            
            return {
              kind: 'MethodCall',
              object: properties[0],
              method: propName,
              arguments: args
            };
          }
        }
        
        return {
          kind: 'PropertyAccess',
          object: properties[0],
          properties: properties.slice(1)
        };
      }
      
      // Check for simple function call with parentheses
      if (peek().kind === 'symbol' && peek().value === '(') {
        next(); // consume '('
        
        const args = [];
        while (peek().kind !== 'symbol' || peek().value !== ')') {
          args.push(parseExpression());
          if (peek().kind === 'symbol' && peek().value === ',') {
            next(); // consume comma
          }
        }
        
        expect('symbol', ')');
        
        return {
          kind: 'CallExpression',
          name,
          arguments: args
        };
      }
      
      // For now, don't handle function calls without parentheses with arguments
      // This causes conflicts with function parameter parsing
      
      // Create identifier, but check for arithmetic after
      const leftExpr = {
        kind: 'Identifier',
        name
      };
      
      // Handle arithmetic operations
      if (peek().kind === 'symbol' && ['+', '-', '*', '/'].includes(peek().value)) {
        const operator = next().value;
        const rightExpr = parseExpression();
        
        return {
          kind: 'BinaryExpression',
          left: leftExpr,
          operator,
          right: rightExpr
        };
      }
      
      return leftExpr;
    }
    
    if (token.kind === 'instance_var') {
      const varName = next().value;
      
      // Check for property access on instance variable (@owner.name)
      if (peek().kind === 'symbol' && peek().value === '.') {
        const properties = [];
        while (peek().kind === 'symbol' && peek().value === '.') {
          next(); // consume '.'
          properties.push(expect('identifier').value);
        }
        
        const instanceVarAccess = {
          kind: 'InstanceVarAccess',
          variable: varName,
          properties
        };
        
        // Handle arithmetic operations on instance variable access
        if (peek().kind === 'symbol' && ['+', '-', '*', '/'].includes(peek().value)) {
          const operator = next().value;
          const rightExpr = parseExpression();
          
          return {
            kind: 'BinaryExpression',
            left: instanceVarAccess,
            operator,
            right: rightExpr
          };
        }
        
        return instanceVarAccess;
      }
      
      // Create instance variable, but check for arithmetic after
      const instanceVar = {
        kind: 'InstanceVar',
        name: varName
      };
      
      // Handle arithmetic operations on instance variables
      if (peek().kind === 'symbol' && ['+', '-', '*', '/'].includes(peek().value)) {
        const operator = next().value;
        const rightExpr = parseExpression();
        
        return {
          kind: 'BinaryExpression',
          left: instanceVar,
          operator,
          right: rightExpr
        };
      }
      
      return instanceVar;
    }
    
    if (token.kind === 'keyword') {
      if (token.value === 'true' || token.value === 'false') {
        return {
          kind: 'BooleanLiteral',
          value: next().value === 'true'
        };
      }
      
      if (token.value === 'null') {
        next();
        return {
          kind: 'NullLiteral'
        };
      }
    }
    
    throw new Error(`Unexpected token in expression: ${JSON.stringify(token)}`);
  }
  
  function parseNewExpression() {
    expect('keyword', 'new');
    const className = expect('identifier').value;
    
    let args = [];
    if (peek().kind === 'symbol' && peek().value === '(') {
      expect('symbol', '(');
      
      // Parse arguments
      while (peek().kind !== 'symbol' || peek().value !== ')') {
        args.push(parseExpression());
        if (peek().kind === 'symbol' && peek().value === ',') {
          next(); // consume comma
        }
      }
      
      expect('symbol', ')');
    }
    
    return {
      kind: 'NewExpression',
      className,
      arguments: args
    };
  }

  return parseProgram();
}