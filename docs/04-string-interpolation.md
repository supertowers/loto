# 4. String Interpolation

String interpolation in Loto uses the `#{}` syntax for embedding expressions directly within strings.

## 4.1 Basic Interpolation

### Variable Interpolation

```loto
name = "Pablo"
age = 30

message = "Hello, #{name}! You are #{age} years old."
print message
# Output: "Hello, Pablo! You are 30 years old."
```

### Expression Interpolation

```loto
def main
  x = 10
  y = 5
  
  result = "#{x} + #{y} = #{x + y}"
  print result
  # Output: "10 + 5 = 15"
  
  comparison = "#{x} is #{x > y ? 'greater' : 'lesser'} than #{y}"
  print comparison  
  # Output: "10 is greater than 5"
end
```

### Function Call Interpolation

```loto
def format_currency(amount : number) : string
  "#{amount} EUR"
end

def main
  price = 99.99
  message = "The product costs #{format_currency(price)}"
  print message
  # Output: "The product costs 99.99 EUR"
end
```

## 4.2 Escaping Braces

When you need literal `#{` in your strings, escape them:

```loto
def main
  # Escaped braces - not interpolated
  literal = "This is a literal \\#{not_interpolated} string"
  print literal
  # Output: "This is a literal #{not_interpolated} string"
  
  # Mixed escaped and interpolated
  name = "Pablo"
  mixed = "Hello #{name}, here's a literal \\#{example}"
  print mixed
  # Output: "Hello Pablo, here's a literal #{example}"
end
```

## 4.3 Interpolation with Class Access (`@`)

String interpolation works seamlessly with instance variables:

```loto
class User
  name : string
  age : number
  email : string

  def construct(name, age, email)
    @name = name
    @age = age
    @email = email
  end

  def get_profile() : string
    "User: #{@name} (#{@age} years old) - Contact: #{@email}"
  end

  def print() : string
    "#{@name} <#{@email}>"
  end
end

class BankAccount
  owner : User
  balance : number
  account_type : string

  def construct(owner, balance, account_type)
    @owner = owner
    @balance = balance
    @account_type = account_type
  end

  def get_statement() : string
    "Account: #{@account_type} | Owner: #{@owner.name} | Balance: #{@balance} EUR"
  end

  def print() : string
    "#{@account_type} Account: #{@owner.name} - #{@balance} EUR"
  end
end

def main
  user = new User("Pablo", 30, "pablo@example.com")
  account = new BankAccount(user, 1500.50, "Savings")
  
  print user.get_profile()
  # Output: "User: Pablo (30 years old) - Contact: pablo@example.com"
  
  print account.get_statement()  
  # Output: "Account: Savings | Owner: Pablo | Balance: 1500.5 EUR"
  
  # Using print() methods
  print user     # Output: "Pablo <pablo@example.com>"
  print account  # Output: "Savings Account: Pablo - 1500.5 EUR"
end
```

## 4.4 Complex Interpolation Examples

### Nested Object Access

```loto
class Address
  street : string
  city : string
  country : string

  def construct(street, city, country)
    @street = street
    @city = city
    @country = country
  end

  def print() : string
    "#{@street}, #{@city}, #{@country}"
  end
end

class Company
  name : string
  address : Address

  def construct(name, address)
    @name = name
    @address = address
  end

  def get_info() : string
    "#{@name} is located at #{@address.street}, #{@address.city}"
  end
end

def main
  address = new Address("123 Main St", "Madrid", "Spain")
  company = new Company("TechCorp", address)
  
  print company.get_info()
  # Output: "TechCorp is located at 123 Main St, Madrid"
end
```

### Conditional Interpolation

```loto
class Product
  name : string
  price : number
  in_stock : boolean

  def construct(name, price, in_stock)
    @name = name
    @price = price
    @in_stock = in_stock
  end

  def get_listing() : string
    availability = @in_stock ? "Available" : "Out of Stock"
    price_display = @in_stock ? "#{@price} EUR" : "Price on request"
    
    "#{@name} - #{price_display} [#{availability}]"
  end
end

def main
  laptop = new Product("Gaming Laptop", 1299.99, true)
  mouse = new Product("Wireless Mouse", 49.99, false)
  
  print laptop.get_listing()
  # Output: "Gaming Laptop - 1299.99 EUR [Available]"
  
  print mouse.get_listing()
  # Output: "Wireless Mouse - Price on request [Out of Stock]"
end
```

### Mathematical Expressions

```loto
def calculate_stats(values : array) : string
  count = values.length
  sum = 0
  
  # Calculate sum (simplified - real implementation would use loops)
  for value in values
    sum = sum + value
  end
  
  average = sum / count
  
  "Dataset: #{count} values, Sum: #{sum}, Average: #{average.toFixed(2)}"
end

def main
  scores = [85, 92, 78, 96, 88]
  stats = calculate_stats(scores)
  print stats
  # Output: "Dataset: 5 values, Sum: 439, Average: 87.80"
end
```

## Key Features

1. **Simple Syntax**: Use `#{}` to embed any expression
2. **Type Flexible**: Works with strings, numbers, booleans, objects
3. **Method Calls**: Call functions and methods within interpolation
4. **Instance Variables**: Access `@variable` directly in strings
5. **Nested Access**: Access object properties with dot notation
6. **Escape Support**: Use `\\#{}` for literal braces

---

**Next:** [Frontend Components](05-frontend-components.md)