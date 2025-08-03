# 🚀 Loto Lang

A modern programming language that compiles to JavaScript, designed for elegant syntax and powerful frontend development.

## ✨ Features

- **Ruby-like syntax** with `def`/`end` blocks for clean, readable code
- **Optional type system** - start untyped for rapid prototyping, add types for production
- **Dual execution modes** - interpreted for development, compiled to JavaScript for deployment
- **Frontend components** - built-in support for React and React Native development
- **String interpolation** - powerful templating with `#{}` syntax
- **Object-oriented programming** with classes, constructors, and methods

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/your-repo/lotolang
cd lotolang/loto-compiler
npm install
```

### Your First Loto Program

Create `hello.loto`:

```loto
def main
  print "Hello, Loto!"
end

main()
```

### Run It

```bash
# Interpreted mode (fastest for development)
node src/cli.js run hello.loto

# Compiled mode (optimized for production)
node src/cli.js build hello.loto
node hello.js
```

## 📚 Language Examples

### Basic Function with Types

```loto
def greet(name : string) : string
  "Hello, #{name}!"
end

print greet("World")
```

### Object-Oriented Programming

```loto
class Wallet
  def constructor(initial_balance : number)
    @balance = initial_balance
  end

  def deposit(amount : number)
    @balance = @balance + amount
    print "Deposited $#{amount}. New balance: $#{@balance}"
  end

  def get_balance() : number
    @balance
  end
end

wallet = new Wallet(100)
wallet.deposit(50)
```

### Frontend Components

```loto
component Counter
  props
    start : number = 0
  end

  state
    count : number = start
  end

  def increment()
    @count = @count + 1
  end

  render
    View.counter
      Text(class="label") Count: {{@count}}
      Pressable(on:press=@increment())
        Text(class="buttonText") +1
  end

  style
    .counter
      backgroundColor: "#f4f4f4"
      padding: 12

    .label
      fontSize: 18

    .buttonText
      color: "white"
      backgroundColor: "blue"
      padding: 8
      borderRadius: 6
  end
end
```

## 🛠️ CLI Commands

```bash
# Run a Loto program in interpreted mode
node src/cli.js run <file.loto>

# Compile to JavaScript
node src/cli.js build <file.loto>

# Show help
node src/cli.js help
```

## 📖 Documentation

- **[📖 Introduction](docs/01-introduction.md)** - What is Loto? Goals, philosophy, and getting started
- **[⚡ Language Basics](docs/02-language-basics.md)** - Syntax, types, variables, and functions
- **[🏗️ Classes and Objects](docs/03-classes-objects.md)** - Object-oriented programming in Loto
- **[💬 String Interpolation](docs/04-string-interpolation.md)** - Dynamic strings with `#{}` syntax
- **[🎨 Frontend Components](docs/05-frontend-components.md)** - Building UI components with built-in syntax
- **[🔧 CLI & Tooling](docs/06-cli-tooling.md)** - Commands, development workflow, and tooling
- **[⚙️ Compiler Architecture](docs/07-compiler-architecture.md)** - Lexer, parser, and code generation
- **[📚 Syntax Reference](docs/08-syntax-reference.md)** - Complete language syntax reference

## 🎯 Examples

Explore working examples in the repository:

- [`0001.hello-world/`](0001.hello-world/) - Basic hello world programs
- [`0002.example-classes/`](0002.example-classes/) - Object-oriented examples
- [`0003.example-components/`](0003.example-components/) - Frontend component examples
- [`loto-compiler/examples/`](loto-compiler/examples/) - Additional code samples

## 🧪 Development

### Running Tests

```bash
cd loto-compiler
npm test
```

### Project Structure

```
lotolang/
├── docs/                    # Documentation
├── 0001.hello-world/       # Basic examples
├── 0002.example-classes/   # OOP examples
├── 0003.example-components/# Component examples
├── loto-compiler/          # Compiler implementation
│   ├── src/               # Source code
│   │   ├── cli.js         # Command-line interface
│   │   ├── lexer.js       # Tokenizer
│   │   ├── parser.js      # AST parser
│   │   └── generator.js   # JavaScript code generator
│   ├── test/              # Test suite
│   └── examples/          # Additional examples
└── vim/                   # Vim syntax highlighting
```

## ✅ Current Status

**Implemented Features:**

✅ **Core Language**
- Function definitions with optional typing
- Classes with constructors and methods
- String interpolation
- Basic control flow

✅ **Frontend Components**
- Component syntax with props/state/render/style blocks
- Event binding and template interpolation
- Scoped styling with camelCase properties

✅ **Tooling**
- CLI with `run` (interpreted) and `build` (compiled) modes
- Comprehensive test suite
- JavaScript code generation

**Planned Features:**

🚧 Control flow (if/else, loops, pattern matching)
🚧 Module system and imports
🚧 Asynchronous programming with fibers
🚧 Self-hosting compiler
🚧 Native compilation targets

## 🤝 Contributing

Loto is currently in active development. We welcome contributions! Please check the issues and feel free to submit pull requests.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by Ruby's elegant syntax and JavaScript's ecosystem, Loto aims to bring the best of both worlds to modern web development.

---

*Get started with Loto by reading the [Introduction](docs/01-introduction.md) or jump straight to the [examples](0001.hello-world/)!*