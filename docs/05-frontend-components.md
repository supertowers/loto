# 5. Frontend Components

Loto provides native support for building frontend components with a clean, declarative syntax. Components compile to modern frameworks and work with both web and mobile development.

## 5.1 Component Structure

Components in Loto follow a structured block-based approach:

```loto
component ComponentName
  props
    # Component properties
  end

  state
    # Component state
  end

  # Methods
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

### 5.1.1 `props`, `state`, `render`, `style`, `end`

Each component can contain these special blocks:

- **`props`**: Define component inputs with optional types and defaults
- **`state`**: Define internal component state variables
- **`render`**: Define the component's visual structure
- **`style`**: Define component-scoped styles
- **Methods**: Regular functions for component logic

## 5.2 Basic Component Example

```loto
component HelloWorld
  props
    name : string = "World"
    greeting : string = "Hello"
  end

  render
    View
      Text "#{@greeting}, #{@name}!"
  end
end
```

## 5.3 Counter Component (Complete Example)

```loto
component Counter
  props
    start : number = 0
    step : number = 1
  end

  state
    count : number = start
  end

  def increment()
    @count = @count + @step
  end

  def decrement()
    @count = @count - @step
  end

  def reset()
    @count = @start
  end

  render
    View.container
      Text.title "Counter: {{@count}}"
      
      View.buttons
        Pressable(on:press=@increment())
          Text.button "+#{@step}"
        
        Pressable(on:press=@decrement())
          Text.button "-#{@step}"
          
        Pressable(on:press=@reset())
          Text.button "Reset"
  end

  style
    .container
      padding: 20
      backgroundColor: "#f0f0f0"
      borderRadius: 8

    .title
      fontSize: 24
      fontWeight: "bold"
      textAlign: "center"
      marginBottom: 20

    .buttons
      flexDirection: "row"
      justifyContent: "space-around"

    .button
      backgroundColor: "#007AFF"
      color: "white"
      padding: 12
      borderRadius: 6
      textAlign: "center"
      minWidth: 60
  end
end
```

## 5.4 Render Syntax

### 5.4.1 Elements

The render block uses a clean, indentation-based syntax:

```loto
render
  View
    Text "Simple text"
    
  View.wrapper
    Text(class="highlight") "Text with CSS class"
    
  ScrollView
    Text "Scrollable content"
    Image(source="logo.png")
end
```

### 5.4.2 Event Binding (`on:event=`)

Bind component methods to user interactions:

```loto
component InteractiveDemo
  state
    message : string = "Click a button!"
  end

  def handle_click()
    @message = "Button was clicked!"
  end

  def handle_double_click()
    @message = "Button was double-clicked!"
  end

  render
    View
      Text @message
      
      Pressable(on:press=@handle_click())
        Text "Single Click"
        
      Pressable(on:doublePress=@handle_double_click())
        Text "Double Click"
end
```

### 5.4.3 Class Application

Two ways to apply CSS classes:

```loto
render
  # Method 1: Using (class="...")
  Text(class="header") "Main Title"
  View(class="container card") "Multiple classes"
  
  # Method 2: Using Tag.className
  Text.header "Main Title"
  View.container.card "Multiple classes with chaining"
end
```

### 5.4.4 Interpolation in Templates

Use `{{}}` for string interpolation in templates:

```loto
component UserProfile
  props
    user : object
  end

  state
    status : string = "online"
  end

  render
    View.profile
      Text.name "{{@user.name}}"
      Text.email "{{@user.email}}"
      Text.status "Status: {{@status}}"
      Text.computed "Hello, {{@user.name}}! You have {{@user.notifications.length}} messages."
end
```

## 5.5 Style System

### 5.5.1 Scoped Styles

Styles are scoped to the component:

```loto
style
  .container
    backgroundColor: "#ffffff"
    padding: 16
    margin: 8
    borderRadius: 12
    
  .title
    fontSize: 18
    fontWeight: "600"
    color: "#333333"
    
  .subtitle
    fontSize: 14
    color: "#666666"
    marginTop: 4
end
```

### 5.5.2 Camel Case Properties

Style properties use camelCase for compatibility:

```loto
style
  .element
    backgroundColor: "#f0f0f0"     # background-color
    borderRadius: 8               # border-radius
    paddingVertical: 12          # padding-top & padding-bottom
    paddingHorizontal: 16        # padding-left & padding-right
    marginBottom: 10             # margin-bottom
    fontSize: 16                 # font-size
    fontWeight: "bold"           # font-weight
    textAlign: "center"          # text-align
end
```

### 5.5.3 Dynamic Styles

Styles can include interpolated values:

```loto
component DynamicCard
  props
    color : string = "#blue"
    size : number = 100
  end

  style
    .card
      backgroundColor: "{{@color}}"
      width: "{{@size}}px"
      height: "{{@size}}px"
      borderRadius: "{{@size / 10}}px"
end
```

## 5.6 Advanced Component Example

```loto
component TodoItem
  props
    task : object
    on_toggle : function
    on_delete : function
  end

  def handle_toggle()
    if defined(@on_toggle)
      @on_toggle(@task.id)
    end
  end

  def handle_delete()
    if defined(@on_delete)
      @on_delete(@task.id)
    end
  end

  render
    View.todo_item(class="{{@task.completed ? 'completed' : 'pending'}}")
      Pressable(on:press=@handle_toggle())
        Text.checkbox "{{@task.completed ? '✓' : '☐'}}"
      
      Text.task_text "{{@task.title}}"
      
      Pressable(on:press=@handle_delete())
        Text.delete_btn "🗑️"
  end

  style
    .todo_item
      flexDirection: "row"
      alignItems: "center"
      padding: 12
      borderBottomWidth: 1
      borderBottomColor: "#eee"

    .todo_item.completed
      opacity: 0.6

    .checkbox
      fontSize: 18
      marginRight: 12
      minWidth: 24

    .task_text
      flex: 1
      fontSize: 16

    .completed .task_text
      textDecorationLine: "line-through"
      color: "#888"

    .delete_btn
      fontSize: 16
      color: "#ff4444"
      padding: 4
  end
end
```

## 5.7 Component Composition

```loto
component App
  state
    todos : array = []
    input_text : string = ""
  end

  def add_todo()
    if @input_text.trim() != ""
      new_todo = {
        id: Date.now(),
        title: @input_text,
        completed: false
      }
      @todos.push(new_todo)
      @input_text = ""
    end
  end

  def toggle_todo(id)
    todo = @todos.find(t => t.id == id)
    if todo
      todo.completed = !todo.completed
    end
  end

  def delete_todo(id)
    @todos = @todos.filter(t => t.id != id)
  end

  render
    View.app
      Text.header "Todo List"
      
      View.input_section
        TextInput.input(
          value=@input_text
          on:change=@input_text
          placeholder="Add a new task..."
        )
        Pressable(on:press=@add_todo())
          Text.add_btn "Add"
      
      ScrollView.todo_list
        TodoItem(
          task=todo
          on_toggle=@toggle_todo
          on_delete=@delete_todo
        ) for todo in @todos
  end

  style
    .app
      flex: 1
      backgroundColor: "#f5f5f5"

    .header
      fontSize: 24
      fontWeight: "bold"
      textAlign: "center"
      padding: 20
      backgroundColor: "#fff"

    .input_section
      flexDirection: "row"
      padding: 16
      backgroundColor: "#fff"
      borderBottomWidth: 1
      borderBottomColor: "#eee"

    .input
      flex: 1
      borderWidth: 1
      borderColor: "#ddd"
      borderRadius: 6
      padding: 12
      marginRight: 12

    .add_btn
      backgroundColor: "#007AFF"
      color: "white"
      padding: 12
      borderRadius: 6
      minWidth: 60
      textAlign: "center"

    .todo_list
      flex: 1
  end
end
```

## Key Features

1. **Declarative Syntax**: Clean, readable component structure
2. **Props & State**: Type-safe component inputs and internal state
3. **Event Handling**: Simple `on:event=` syntax for interactions
4. **Scoped Styles**: Component-level CSS with camelCase properties
5. **String Interpolation**: Use `{{}}` for dynamic content in templates
6. **Component Composition**: Nest and reuse components easily

Components compile to efficient, modern framework code suitable for both web and mobile deployment.

---

**Next:** [CLI and Tooling](06-cli-tooling.md)