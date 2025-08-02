# Loto Compiler

A compiler for the Loto programming language that transpiles to JavaScript.

## Features

- **Ruby-like syntax** with `def`/`end` blocks
- **Optional parentheses** for function calls and declarations  
- **Optional type annotations** (lowercase primitive types: `void`, `string`, `number`, etc.)
- **Interpreted mode** for rapid prototyping
- **Compiled mode** for production deployment
- **Comment support** with `#`

## Installation

```bash
npm install
# or
yarn install
```

## Usage

### Run Loto files directly (interpreted)
```bash
node src/cli.js run examples/hello.loto
```

### Compile Loto files to JavaScript
```bash
node src/cli.js build examples/hello.loto
node examples/hello.js
```

### Get help
```bash
node src/cli.js help
```

## Examples

### Basic Hello World (untyped)
```loto
# hello.loto
def main
  print "Hello, world!"
end

main()
```

### Typed Hello World
```loto  
# hello_strict.loto
def main() : void
  print "Hello, world!"
end

main()
```

## Testing

Run the comprehensive test suite:

```bash
yarn test
```

The tests cover:
- **Lexer tests**: Tokenization of Loto source code
- **Parser tests**: AST generation from tokens
- **Generator tests**: JavaScript code generation
- **CLI tests**: Command-line interface functionality
- **End-to-end tests**: Complete workflow from Loto to JavaScript

## Development Workflow

1. **Prototype**: Start with untyped Loto code for rapid development
2. **Stabilize**: Add type annotations when functionality is stable
3. **Deploy**: Compile to optimized JavaScript for production

## Architecture

- `src/lexer.js` - Tokenizes Loto source code
- `src/parser.js` - Parses tokens into Abstract Syntax Tree
- `src/generator.js` - Generates JavaScript from AST
- `src/cli.js` - Command-line interface
- `test/` - Comprehensive test suite

## License

MIT