# 8. Syntax Reference

Quick reference for all Loto language constructs with examples.

## 8.1 Comments

```loto
# Single line comment
def main  # End of line comment
  # Another comment
  print "Hello"
end
```

## 8.2 Variables and Types

### Variable Declaration

```loto
# Untyped variables
name = "Pablo"
age = 30
active = true

# Typed variables
username : string = "admin"  
count : number = 0
flag : boolean = false
data : any = "flexible"
```

### Type Annotations

```loto
# Primitive types (lowercase)
text : string
num : number  
flag : boolean
anything : any
nothing : void  # For functions only
```

## 8.3 Functions

### Function Declaration

```loto
# Untyped function
def greet
  print "Hello!"
end

# Typed function  
def add(x : number, y : number) : number
  x + y
end

# Function with default parameters
def greet(name : string = "World")
  print "Hello, #{name}!"
end
```

### Function Calls

```loto
# No parentheses for zero arguments
greet
greet()

# Parentheses required for arguments
greet("Pablo")
result = add(5, 3)
```

### Return Statements

```loto
# Implicit return (last expression)
def double(x : number) : number
  x * 2
end

# Explicit return
def check(x : number) : boolean
  if x > 0
    return true
  end
  return false
end
```

## 8.4 Classes

### Class Declaration

```loto
class User
  name : string
  age : number
  active : boolean = true  # Default value
end
```

### Constructor

```loto
class User
  name : string
  email : string

  def construct(name, email)
    @name = name
    @email = email
  end
end
```

### Methods

```loto
class Counter
  value : number = 0

  def increment() : void
    @value = @value + 1
  end

  def get_value() : number
    @value
  end

  # Special print method for CLI output
  def print() : string
    "Counter: #{@value}"
  end
end
```

### Object Creation

```loto
user = new User("Pablo", "pablo@example.com")
counter = new Counter
```

## 8.5 String Interpolation

### Basic Interpolation

```loto
name = "Pablo"
age = 30
message = "Hello #{name}, you are #{age} years old"
```

### Expression Interpolation

```loto
x = 10
y = 5
result = "#{x} + #{y} = #{x + y}"
calculation = "Average: #{(x + y) / 2}"
```

### Instance Variable Interpolation

```loto
class User
  name : string
  
  def get_greeting() : string
    "Hello, I'm #{@name}!"
  end
end
```

### Escaping

```loto
literal = "This is a literal \\#{not_interpolated} string"
```

## 8.6 Components

### Component Structure

```loto
component ComponentName
  props
    prop_name : type = default_value
  end

  state
    state_var : type = initial_value
  end

  def method_name()
    # Component logic
  end

  render
    # Template markup
  end

  style
    # Component styles
  end
end
```

### Props and State

```loto
component Counter
  props
    start : number = 0
    step : number = 1
    title : string = "Counter"
  end

  state
    count : number = start
    active : boolean = true
  end
end
```

### Methods

```loto
def increment()
  @count = @count + @step
end

def reset()
  @count = @start
end
```

### Render Block

```loto
render
  # Elements
  View
    Text "Simple text"
    
  # CSS classes (two ways)
  Text(class="header") "Method 1"
  Text.header "Method 2"
  
  # Multiple classes
  View(class="container card") "Multiple classes"
  View.container.card "Multiple classes (chained)"
  
  # Event binding
  Pressable(on:press=@increment())
    Text "+1"
    
  # String interpolation in templates
  Text "Count: {{@count}}"
  Text "Welcome {{@user.name}}!"
end
```

### Style Block

```loto
style
  .container
    backgroundColor: "#ffffff"
    padding: 16
    margin: 8
    borderRadius: 12
    
  .header
    fontSize: 18
    fontWeight: "600"
    color: "#333333"
    
  # Dynamic styles with interpolation
  .dynamic
    backgroundColor: "{{@theme_color}}"
    width: "{{@size}}px"
end
```

## 8.7 Built-in Functions

### `print()`

```loto
print "Hello, world!"
print 42
print true

# With objects (calls object's print() method if available)
user = new User("Pablo")
print user
```

### `defined()`

```loto
name = "Pablo"
empty = null

if defined(name)
  print "Name is defined"
end

if not defined(empty)
  print "Empty is null or undefined"  
end
```

## 8.8 Operators

### Arithmetic

```loto
result = a + b      # Addition
result = a - b      # Subtraction  
result = a * b      # Multiplication
result = a / b      # Division
result = a % b      # Modulo
```

### Comparison

```loto
a == b      # Equality
a != b      # Inequality  
a < b       # Less than
a <= b      # Less than or equal
a > b       # Greater than
a >= b      # Greater than or equal
```

### Logical

```loto
a and b     # Logical AND
a or b      # Logical OR
not a       # Logical NOT
```

### Assignment

```loto
a = 5           # Simple assignment
@name = "test"  # Instance variable assignment
a = b = c = 0   # Multiple assignment
```

## 8.9 Control Flow

### Conditionals (Planned)

```loto
# Basic if
if condition
  # code
end

# If-else
if condition
  # code
else
  # alternative code  
end

# If-elsif-else
if condition1
  # code1
elsif condition2
  # code2
else
  # default code
end
```

### Loops (Planned)

```loto
# For loop
for item in collection
  print item
end

# While loop
while condition
  # code
end
```

## 8.10 Component Elements

### Basic Elements

```loto
render
  View          # Container
  Text "Hello"  # Text display
  Image         # Image display
  ScrollView    # Scrollable container
  Pressable     # Touchable element
  TextInput     # Text input field
end
```

### Element Properties

```loto
render
  Text(class="header", style="color: red") "Styled text"
  Image(source="logo.png", width="100", height="100")
  TextInput(placeholder="Enter text", value=@input_text)
  Pressable(on:press=@handle_click(), disabled=@is_loading)
    Text "Click me"
end
```

### Event Handling

```loto
render
  Pressable(on:press=@handle_press())
    Text "Press me"
    
  TextInput(on:change=@handle_text_change())
  
  ScrollView(on:scroll=@handle_scroll())
    # Scrollable content
end
```

## 8.11 Style Properties

### Layout

```loto
style
  .container
    display: "flex"
    flexDirection: "row"
    justifyContent: "center"
    alignItems: "center"
    flex: 1
end
```

### Spacing

```loto
style  
  .element
    margin: 10
    marginTop: 5
    marginHorizontal: 15
    padding: 20
    paddingVertical: 12
end
```

### Typography

```loto
style
  .text
    fontSize: 16
    fontWeight: "bold"
    fontFamily: "Arial"
    color: "#333333"
    textAlign: "center"
    lineHeight: 20
end
```

### Appearance

```loto
style
  .box
    backgroundColor: "#ffffff"
    borderWidth: 1
    borderColor: "#cccccc"
    borderRadius: 8
    opacity: 0.9
end
```

## 8.12 Complete Example

```loto
# User management component
component UserCard
  props
    user : object
    editable : boolean = false
  end

  state
    editing : boolean = false
    temp_name : string = user.name
  end

  def start_edit()
    @editing = true
    @temp_name = @user.name
  end

  def save_edit()
    @user.name = @temp_name
    @editing = false
  end

  def cancel_edit()
    @temp_name = @user.name
    @editing = false
  end

  render
    View.card
      if @editing
        TextInput.name_input(
          value=@temp_name
          on:change=@temp_name
          placeholder="Enter name"
        )
        View.buttons
          Pressable(on:press=@save_edit())
            Text.save_btn "Save"
          Pressable(on:press=@cancel_edit())
            Text.cancel_btn "Cancel"
      else
        Text.name "{{@user.name}}"
        Text.email "{{@user.email}}"
        if @editable
          Pressable(on:press=@start_edit())
            Text.edit_btn "Edit"
        end
      end
  end

  style
    .card
      backgroundColor: "#ffffff"
      padding: 16
      margin: 8
      borderRadius: 8
      borderWidth: 1
      borderColor: "#e0e0e0"

    .name
      fontSize: 18
      fontWeight: "bold"
      marginBottom: 4

    .email
      fontSize: 14
      color: "#666666"
      marginBottom: 12

    .name_input
      borderWidth: 1
      borderColor: "#cccccc"
      borderRadius: 4
      padding: 8
      fontSize: 16
      marginBottom: 12

    .buttons
      flexDirection: "row"
      justifyContent: "space-around"

    .save_btn, .cancel_btn, .edit_btn
      backgroundColor: "#007AFF"
      color: "white"
      padding: 8
      borderRadius: 4
      textAlign: "center"
      minWidth: 60

    .cancel_btn
      backgroundColor: "#FF3B30"
  end
end
```

---

This completes the comprehensive syntax reference for the Loto programming language.