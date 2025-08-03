# 1. Introduction

## 1.1 What is Loto?

Loto is a modern programming language that combines the elegance of Ruby's syntax with the power of JavaScript's ecosystem. It features:

- **Ruby-like syntax** with `def`/`end` blocks for clean, readable code
- **Optional type system** - start untyped for rapid prototyping, add types for production
- **Dual execution modes** - interpreted for development, compiled to JavaScript for deployment
- **Frontend components** - built-in support for React and React Native development
- **String interpolation** - powerful templating with `#{}` syntax

## 1.2 Language Goals

Loto is designed to bridge the gap between rapid prototyping and production-ready code:

1. **Developer Experience First** - Clean syntax that's easy to read and write
2. **Gradual Typing** - Optional type annotations that can be added incrementally  
3. **Frontend-Focused** - Native support for component-based UI development
4. **JavaScript Interop** - Seamless integration with existing JS ecosystems
5. **Performance** - Compiles to optimized JavaScript for production use

## 1.3 Core Philosophy

- **Start Simple, Scale Up** - Begin with untyped code, add structure as needed
- **Convention over Configuration** - Sensible defaults with minimal boilerplate
- **Unified Development** - Same language for backend logic and frontend components
- **Modern Tooling** - Built-in CLI, testing, and development workflow

## 1.4 Getting Started

### Installation

```bash
git clone https://github.com/your-repo/lotolang
cd lotolang/loto-compiler
npm install
```

### Your First Loto Program

Create a file called `hello.loto`:

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

### What's Next?

- Learn the [Language Basics](02-language-basics.md)
- Explore [Classes and Objects](03-classes-objects.md)  
- Build [Frontend Components](05-frontend-components.md)
- Check out the [Examples](../0001.hello-world/) directory

---

*Loto is currently in active development. Join us in building the future of web development!*