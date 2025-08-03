// lexer.js
// Loto lexer - converts source code into tokens

export function lex(src) {
  const tokens = [];
  const indentStack = [0];
  const lines = src.split(/\r?\n/);
  
  let currentLineNum = 0;
  const push = (token) => tokens.push({ ...token, line: currentLineNum + 1 });

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    currentLineNum = lineNum;
    const line = lines[lineNum];
    
    // Handle indentation
    const indentMatch = line.match(/^\s*/);
    const currentIndent = indentMatch ? indentMatch[0].length : 0;
    const content = line.trim();
    
    // Skip empty lines and comments (but still emit newlines)
    if (!content || content.startsWith('#')) {
      push({ kind: 'newline' });
      continue;
    }
    
    // Handle indentation changes for non-empty lines
    if (currentIndent > indentStack[indentStack.length - 1]) {
      indentStack.push(currentIndent);
      push({ kind: 'indent' });
    } else if (currentIndent < indentStack[indentStack.length - 1]) {
      while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        push({ kind: 'dedent' });
      }
      if (currentIndent !== indentStack[indentStack.length - 1]) {
        throw new Error(`Indentation error at line ${lineNum + 1}`);
      }
    }
    
    // Tokenize the line content
    let remaining = content;
    
    while (remaining.length > 0) {
      // Skip whitespace
      const wsMatch = remaining.match(/^\s+/);
      if (wsMatch) {
        remaining = remaining.slice(wsMatch[0].length);
        continue;
      }
      
      // JSX interpolation {{...}}
      if (remaining.startsWith('{{') && remaining.includes('}}')) {
        const closeIndex = remaining.indexOf('}}');
        const content = remaining.slice(2, closeIndex);
        push({ kind: 'jsx_interpolation', value: content });
        remaining = remaining.slice(closeIndex + 2);
        continue;
      }
      
      // String literals (with interpolation support)
      const stringMatch = remaining.match(/^"([^"]*)"/);
      if (stringMatch) {
        const stringContent = stringMatch[1];
        
        // Check if string contains interpolation (only #{} pattern)
        if (stringContent.includes('#{')) {
          push({ kind: 'interpolated_string', value: stringContent });
        } else {
          push({ kind: 'string', value: stringContent });
        }
        
        remaining = remaining.slice(stringMatch[0].length);
        continue;
      }
      
      // Multi-character operators
      const multiCharOps = ['==', '!=', '<=', '>=', '&&', '||'];
      let foundMultiChar = false;
      for (const op of multiCharOps) {
        if (remaining.startsWith(op)) {
          push({ kind: 'operator', value: op });
          remaining = remaining.slice(op.length);
          foundMultiChar = true;
          break;
        }
      }
      if (foundMultiChar) continue;
      
      // Single-character symbols and operators
      if (remaining[0] === '(' || remaining[0] === ')' || remaining[0] === ':' || 
          remaining[0] === '.' || remaining[0] === '=' || remaining[0] === '{' || 
          remaining[0] === '}' || remaining[0] === ',' || remaining[0] === '+' || 
          remaining[0] === '-' || remaining[0] === '*' || remaining[0] === '/' || 
          remaining[0] === '!' || remaining[0] === '?' || remaining[0] === ';' ||
          remaining[0] === '<' || remaining[0] === '>') {
        const value = remaining[0];
        const kind = ['<', '>', '!'].includes(value) ? 'operator' : 'symbol';
        push({ kind, value });
        remaining = remaining.slice(1);
        continue;
      }
      
      // Instance variables (@variable)
      if (remaining[0] === '@') {
        const varMatch = remaining.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/);
        if (varMatch) {
          push({ kind: 'instance_var', value: varMatch[0] });
          remaining = remaining.slice(varMatch[0].length);
          continue;
        }
      }
      
      // Keywords and identifiers
      const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        const keywords = ['def', 'end', 'print', 'if', 'else', 'elsif', 'return', 'true', 'false', 'null', 'class', 'new', 'construct', 'component', 'props', 'state', 'render', 'style'];
        const kind = keywords.includes(word) ? 'keyword' : 'identifier';
        push({ kind, value: word });
        remaining = remaining.slice(word.length);
        continue;
      }
      
      // Numbers
      const numberMatch = remaining.match(/^\d+(\.\d+)?/);
      if (numberMatch) {
        push({ kind: 'number', value: numberMatch[0] });
        remaining = remaining.slice(numberMatch[0].length);
        continue;
      }
      
      throw new Error(`Unknown token at line ${lineNum + 1}: "${remaining[0]}"`);
    }
    
    push({ kind: 'newline' });
  }
  
  // Close any remaining indentation levels
  while (indentStack.length > 1) {
    indentStack.pop();
    push({ kind: 'dedent' });
  }
  
  push({ kind: 'eof' });
  return tokens;
}