# 7. Compiler Architecture

The Loto compiler is built as a traditional three-stage compiler that transforms Loto source code into executable JavaScript.

## 7.1 Overview

```
Loto Source Code
       ↓
   Lexer (Tokenization)
       ↓
   Parser (AST Generation)
       ↓
   Generator (Code Generation)
       ↓
   JavaScript Output
```

## 7.2 Lexer (`src/lexer.js`)

The lexer converts raw source code into a stream of tokens.

### 7.2.1 Tokenization Process

```javascript
// Input: Loto source code
def main
  print "Hello, world!"
end

// Output: Token stream
[
  { kind: 'keyword', value: 'def' },
  { kind: 'identifier', value: 'main' },
  { kind: 'newline' },
  { kind: 'indent' },
  { kind: 'keyword', value: 'print' },
  { kind: 'string', value: 'Hello, world!' },
  { kind: 'newline' },
  { kind: 'dedent' },
  { kind: 'keyword', value: 'end' },
  { kind: 'eof' }
]
```

### 7.2.2 Token Types

The lexer recognizes these token types:

- **Keywords**: `def`, `end`, `class`, `component`, `if`, `else`, `return`, etc.
- **Identifiers**: Variable and function names
- **Literals**: Strings (`"hello"`), numbers (`42`, `3.14`), booleans (`true`, `false`)
- **Operators**: `+`, `-`, `*`, `/`, `=`, `==`, `!=`, etc.
- **Punctuation**: `(`, `)`, `,`, `:`, `.`, `@`
- **Indentation**: `indent`, `dedent`, `newline`
- **Special**: `eof` (end of file)

### 7.2.3 Indentation Handling

The lexer tracks indentation levels to generate `indent` and `dedent` tokens:

```loto
def main        # indent level 0
  if true       # indent level 2 → emit 'indent'
    print "hi"  # indent level 4 → emit 'indent'  
  end           # indent level 2 → emit 'dedent'
end             # indent level 0 → emit 'dedent'
```

### 7.2.4 String Interpolation Lexing

String interpolation (`#{}`) is handled during lexing:

```loto
"Hello #{name}!"
# Becomes:
[
  { kind: 'string', value: 'Hello ' },
  { kind: 'interpolation_start' },
  { kind: 'identifier', value: 'name' },
  { kind: 'interpolation_end' },
  { kind: 'string', value: '!' }
]
```

## 7.3 Parser (`src/parser.js`)

The parser converts the token stream into an Abstract Syntax Tree (AST).

### 7.3.1 AST Node Types

The parser generates these AST node types:

```javascript
// Program (root node)
{
  kind: 'Program',
  body: [/* statements */]
}

// Function Declaration
{
  kind: 'FunctionDeclaration',
  name: 'main',
  parameters: [],
  returnType: null,
  body: [/* statements */]
}

// Class Declaration
{
  kind: 'ClassDeclaration',
  name: 'User',
  fields: [/* field declarations */],
  methods: [/* method declarations */]
}

// Component Declaration
{
  kind: 'ComponentDeclaration',
  name: 'Counter',
  props: [/* prop declarations */],
  state: [/* state declarations */],
  methods: [/* methods */],
  renderBlock: {/* render AST */},
  styleBlock: {/* style rules */}
}
```

### 7.3.2 Parsing Strategy

The parser uses **recursive descent parsing**:

```javascript
function parseStatement() {
  const token = peek();
  
  switch (token.kind) {
    case 'keyword':
      if (token.value === 'def') return parseFunctionDeclaration();
      if (token.value === 'class') return parseClassDeclaration();
      if (token.value === 'component') return parseComponentDeclaration();
      if (token.value === 'if') return parseIfStatement();
      // ... other keywords
      break;
      
    case 'identifier':
      return parseExpressionStatement();
      
    default:
      throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }
}
```

### 7.3.3 Expression Parsing

Expressions are parsed with operator precedence:

```javascript
// Expression: a + b * c
{
  kind: 'BinaryExpression',
  operator: '+',
  left: { kind: 'Identifier', name: 'a' },
  right: {
    kind: 'BinaryExpression',
    operator: '*',
    left: { kind: 'Identifier', name: 'b' },
    right: { kind: 'Identifier', name: 'c' }
  }
}
```

### 7.3.4 Component Parsing

Components have special parsing rules for their blocks:

```javascript
// component Counter ... end
{
  kind: 'ComponentDeclaration',
  name: 'Counter',
  props: [
    { name: 'start', type: 'number', defaultValue: 0 }
  ],
  state: [
    { name: 'count', type: 'number', initialValue: 'start' }
  ],
  methods: [
    {
      kind: 'FunctionDeclaration',
      name: 'increment',
      body: [/* method body */]
    }
  ],
  renderBlock: {
    kind: 'RenderBlock',
    elements: [/* JSX-like elements */]
  },
  styleBlock: {
    kind: 'StyleBlock',
    rules: [/* CSS rules */]
  }
}
```

## 7.4 Generator (`src/generator.js`)

The generator converts the AST into executable JavaScript code.

### 7.4.1 Code Generation Strategy

Each AST node type has a corresponding generator function:

```javascript
function generateStatement(node, output, indent = 0) {
  switch (node.kind) {
    case 'FunctionDeclaration':
      generateFunction(node, output, indent);
      break;
      
    case 'ClassDeclaration':
      generateClass(node, output, indent);
      break;
      
    case 'ComponentDeclaration':
      generateComponent(node, output, indent);
      break;
      
    // ... other node types
  }
}
```

### 7.4.2 Runtime Helpers

The generator adds runtime helpers to every output file:

```javascript
// Runtime helpers
function print(value) {
  // If the value has a print method, call it
  if (value && typeof value.print === "function") {
    console.log(value.print());
  } else {
    console.log(value);
  }
}

function defined(value) {
  return value !== null && value !== undefined;
}
```

### 7.4.3 Class Generation

Classes are generated as JavaScript classes:

```loto
# Loto input
class User
  name : string
  
  def construct(name)
    @name = name
  end
  
  def greet() : string
    "Hello, #{@name}!"
  end
end
```

```javascript
// Generated JavaScript
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}!`;
  }
}
```

### 7.4.4 Component Generation

Components generate framework-specific code (React example):

```loto
# Loto input
component Counter
  state
    count : number = 0
  end
  
  def increment()
    @count = @count + 1
  end
  
  render
    View
      Text "Count: {{@count}}"
      Pressable(on:press=@increment())
        Text "+1"
  end
end
```

```javascript
// Generated JavaScript (React)
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);
  };
  
  return (
    <View>
      <Text>Count: {count}</Text>
      <Pressable onPress={increment}>
        <Text>+1</Text>
      </Pressable>
    </View>
  );
}
```

### 7.4.5 String Interpolation Generation

String interpolation compiles to template literals:

```loto
# Loto input
name = "Pablo"
message = "Hello, #{name}!"
```

```javascript
// Generated JavaScript
let name = "Pablo";
let message = `Hello, ${name}!`;
```

## 7.5 CLI Integration (`src/cli.js`)

The CLI orchestrates the compilation pipeline:

```javascript
function compile(sourceFile) {
  // 1. Read source code
  const source = fs.readFileSync(sourceFile, 'utf8');
  
  // 2. Tokenize
  const tokens = lex(source);
  
  // 3. Parse
  const ast = parse(tokens);
  
  // 4. Generate
  const jsCode = generate(ast);
  
  // 5. Write output
  const outputFile = sourceFile.replace('.loto', '.js');
  fs.writeFileSync(outputFile, jsCode);
}
```

### Interpreted Mode

For `run` command, the CLI executes generated JavaScript directly:

```javascript
function runInterpreted(sourceFile) {
  const jsCode = compile(sourceFile);
  eval(jsCode);  // Execute immediately
}
```

### Build Mode

For `build` command, the CLI writes JavaScript to disk:

```javascript
function buildToFile(sourceFile) {
  const jsCode = compile(sourceFile);
  const outputFile = sourceFile.replace('.loto', '.js');
  fs.writeFileSync(outputFile, jsCode);
  console.log(`✓ Built ${outputFile}`);
}
```

## 7.6 Error Handling

### Lexer Errors

```javascript
// Invalid character
throw new Error(`Unexpected character: '${char}' at line ${lineNum}`);
```

### Parser Errors

```javascript
// Missing expected token
throw new Error(`Expected ${kind}${value ? ` "${value}"` : ''} but got ${JSON.stringify(token)}`);
```

### Generator Errors

```javascript
// Unsupported AST node
throw new Error(`Unsupported node kind: ${node.kind}`);
```

## 7.7 Testing Architecture

The compiler includes comprehensive tests:

- **`test/lexer.test.js`**: Token generation tests
- **`test/parser.test.js`**: AST generation tests  
- **`test/generator.test.js`**: Code generation tests
- **`test/cli.test.js`**: CLI interface tests
- **`test/e2e.test.js`**: End-to-end workflow tests

### Test Structure

```javascript
describe('Lexer', () => {
  it('should tokenize simple function declaration', () => {
    const source = `def main\n  print "Hello"\nend`;
    const tokens = lex(source);
    
    assert.strictEqual(tokens[0].kind, 'keyword');
    assert.strictEqual(tokens[0].value, 'def');
    // ... more assertions
  });
});
```

---

**Next:** [Syntax Reference](08-syntax-reference.md)