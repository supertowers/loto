# 2. Language Basics

## 2.1 File Structure and Extensions

Loto files use the `.loto` extension and follow a simple structure:

```loto
# Comments start with #
def main
  print "Hello, world!"
end

main()
```

### Key Points:
- Files typically contain function definitions and a main execution call
- Comments use `#` syntax (similar to Ruby/Python)  
- Indentation matters for code blocks
- No semicolons required

## 2.2 Syntax Overview

### Function Definitions

```loto
# Untyped function (rapid prototyping)
def greet
  print "Hello!"
end

# Typed function (production ready)
def greet(name : string) : void
  print "Hello, #{name}!"
end

# Function with return value
def add(a : number, b : number) : number
  a + b
end
```

### Function Calls

```loto
# Parentheses are optional for calls without arguments
greet
greet()

# Required for calls with arguments
greet("Pablo")
result = add(5, 3)
```

## 2.3 Types and Type System

Loto features a **gradual type system** - you can start without types and add them incrementally.

### 2.3.1 Primitive Types

```loto
name : string = "Pablo"
age : number = 30
active : boolean = true
data : any = "could be anything"
nothing : void  # Functions that don't return
```

### 2.3.2 Type Annotations

Types are always lowercase and follow the `: type` syntax:

```loto
# Variable declarations
username : string = "admin"
count : number = 0

# Function parameters and return types
def process(data : string, count : number) : boolean
  # implementation
  true
end
```

### 2.3.3 `any` and `null`

```loto
# any type accepts any value
flexible : any = "string"
flexible = 42
flexible = true

# null handling
optional_name : string = null
if defined(optional_name)
  print optional_name
end
```

### 2.3.4 Optional Parameters and `defined()`

```loto
def greet(name : string = "World")
  print "Hello, #{name}!"
end

def process(data : any)
  if defined(data)
    print "Processing: #{data}"
  else
    print "No data to process"
  end
end

# Usage
greet()           # "Hello, World!"  
greet("Pablo")    # "Hello, Pablo!"
process(null)     # "No data to process"
process("test")   # "Processing: test"
```

## 2.4 Variables and Constants

### Variable Assignment

```loto
# Simple assignment
name = "Pablo"
age = 30

# Typed assignment
username : string = "admin"
count : number = 0

# Multiple assignment
a = b = c = 5
```

### Variable Scope

```loto
global_var = "accessible everywhere"

def example
  local_var = "only inside this function"
  print global_var  # Works
  print local_var   # Works
end

# print local_var  # Error: undefined
```

## 2.5 Functions

### 2.5.1 Named Functions

```loto
# Basic function
def say_hello
  print "Hello!"
end

# Function with parameters
def greet(name)
  print "Hello, #{name}!"
end

# Typed function
def calculate(x : number, y : number) : number
  x * y + 10
end
```

### 2.5.2 Return Types  

```loto
# Implicit return (last expression)
def add(a : number, b : number) : number
  a + b  # This is returned
end

# Explicit return
def get_message() : string
  if true
    return "Success"
  end
  return "Failed"
end

# Void functions
def log_message(msg : string) : void
  print "LOG: #{msg}"
  # No return value
end
```

### 2.5.3 Implicit vs. Explicit Returns

```loto
# Implicit return - last expression is returned
def double(x : number) : number
  x * 2  # Automatically returned
end

# Explicit return - use return keyword
def check_positive(x : number) : boolean
  if x > 0
    return true
  else
    return false
  end
end

# Mixed style
def process(value : number) : string
  if value < 0
    return "negative"  # Early return
  end
  
  result = value * 2
  "Result: #{result}"  # Implicit return
end
```

## Built-in Functions

### `print()`
Outputs values to the console. If an object has a `print()` method, it will be called automatically.

```loto
print "Hello, world!"
print 42
print true

# With objects (see Classes section)
user = new User("Pablo")
print user  # Calls user.print() if it exists
```

### `defined()`
Checks if a value is not null or undefined.

```loto
name = "Pablo"
empty = null

print defined(name)   # true
print defined(empty)  # false
print defined(undefined_var)  # false
```

---

**Next:** [Classes and Objects](03-classes-objects.md)