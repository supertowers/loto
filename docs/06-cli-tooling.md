# 6. CLI and Tooling

The Loto compiler provides a command-line interface for running and building Loto programs.

## 6.1 Installation and Setup

```bash
# Clone the repository
git clone <repository-url>
cd lotolang/loto-compiler

# Install dependencies
npm install
# or
yarn install
```

## 6.2 Basic Commands

### 6.2.1 `loto run` - Interpreted Execution

Run Loto files directly without compilation (fastest for development):

```bash
node src/cli.js run examples/hello.loto
node src/cli.js run your_file.loto
```

**Use cases:**
- Rapid prototyping
- Testing small scripts
- Development and debugging

**Example:**
```bash
$ node src/cli.js run examples/hello.loto
Hello, world!
```

### 6.2.2 `loto build` - Compilation

Compile Loto files to JavaScript for production deployment:

```bash
node src/cli.js build examples/hello.loto
node src/cli.js build your_file.loto
```

This generates a JavaScript file with the same name:
- `hello.loto` → `hello.js`
- `my_app.loto` → `my_app.js`

**Use cases:**
- Production deployment
- Performance optimization
- Integration with existing JavaScript projects

**Example:**
```bash
$ node src/cli.js build examples/hello.loto
✓ Built examples/hello.js

$ node examples/hello.js
Hello, world!
```

### 6.2.3 `loto help` - Usage Information

Display available commands and usage information:

```bash
node src/cli.js help
```

Output:
```
Usage: loto <command> <file>

Commands:
  run    <file.loto>    Run Loto file directly (interpreted)
  build  <file.loto>    Compile Loto file to JavaScript
  help                  Show this help message
```

## 6.3 Development Workflow

### Prototype → Stabilize → Deploy

**1. Prototype Phase (Interpreted Mode)**
```bash
# Quick iteration with untyped code
node src/cli.js run prototype.loto
```

**2. Stabilize Phase (Add Types)**
```loto
# Add type annotations as functionality stabilizes
def calculate(x : number, y : number) : number
  x * y
end
```

**3. Deploy Phase (Compiled Mode)**
```bash
# Compile for production
node src/cli.js build app.loto
node app.js
```

## 6.4 Working with Examples

The compiler includes several example files:

```bash
# Run examples directly
node src/cli.js run examples/hello.loto
node src/cli.js run examples/hello_strict.loto
node src/cli.js run examples/simple_interpolation.loto
node src/cli.js run examples/simple_class.loto
node src/cli.js run examples/wallet_updating.loto

# Or build them first
node src/cli.js build examples/wallet_updating.loto
node examples/wallet_updating.js
```

## 6.5 File Organization

### Recommended Project Structure

```
my-loto-project/
├── src/
│   ├── main.loto           # Main application
│   ├── models/
│   │   ├── user.loto       # User class
│   │   └── wallet.loto     # Wallet class
│   └── components/
│       ├── header.loto     # Header component
│       └── counter.loto    # Counter component
├── build/                  # Compiled JavaScript output
├── tests/
│   └── main.test.loto      # Test files
└── README.md
```

### Build Organization

```bash
# Build all source files
node src/cli.js build src/main.loto
node src/cli.js build src/models/user.loto
node src/cli.js build src/models/wallet.loto

# Run the main application
node src/main.js
```

## 6.6 Error Handling

### Compilation Errors

When compilation fails, you'll see detailed error messages:

```bash
$ node src/cli.js build broken.loto
Error: Expected 'end' but got {"kind":"eof","value":""}
    at parse (src/parser.js:45:15)
    at compile (src/cli.js:67:20)
```

### Runtime Errors

```bash
$ node src/cli.js run error_example.loto
Error: Cannot read property 'name' of undefined
    at main (generated code:15:3)
```

## 6.7 Generated JavaScript Output

### Runtime Helpers

All compiled Loto files include runtime helpers:

```javascript
// ---- Loto → JavaScript ----

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

// Your compiled code follows...
```

### Class Compilation

Loto classes compile to JavaScript classes:

```loto
# Loto source
class User
  name : string
  def construct(name)
    @name = name
  end
end
```

```javascript
// Compiled JavaScript
class User {
  constructor(name) {
    this.name = name;
  }
}
```

### Function Compilation

```loto
# Loto source
def greet(name : string) : void
  print "Hello, #{name}!"
end
```

```javascript
// Compiled JavaScript
function greet(name) {
  print(`Hello, ${name}!`);
}
```

## 6.8 Integration with Build Tools

### Package.json Scripts

Add Loto commands to your `package.json`:

```json
{
  "scripts": {
    "dev": "node src/cli.js run src/main.loto",
    "build": "node src/cli.js build src/main.loto",
    "start": "node src/main.js",
    "build:all": "find src -name '*.loto' -exec node src/cli.js build {} \\;"
  }
}
```

### Development Scripts

```bash
# Development with file watching (using nodemon or similar)
npx nodemon --exec "node src/cli.js run src/main.loto" --ext loto

# Build script for multiple files
#!/bin/bash
for file in src/**/*.loto; do
  node src/cli.js build "$file"
done
```

## 6.9 Testing

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

### Running Specific Tests

```bash
# Run only lexer tests
node --test test/lexer.test.js

# Run only end-to-end tests
node --test test/e2e.test.js
```

---

**Next:** [Compiler Architecture](07-compiler-architecture.md)