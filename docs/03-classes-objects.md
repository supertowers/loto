# 3. Classes and Objects

## 3.1 Class Definitions

Classes in Loto use a clean, block-based syntax:

```loto
class User
  name : string
  age : number
end
```

### Class with Constructor

```loto
class User
  name : string
  age : number
  active : boolean

  def construct(name, age)
    @name = name
    @age = age
    @active = true
  end
end
```

## 3.2 Properties and Fields

### Field Declaration

```loto
class Product
  id : string
  name : string
  price : number
  available : boolean = true  # Default value
end
```

### Field Access

```loto
product = new Product
product.name = "Laptop"
product.price = 999.99

print product.name   # "Laptop"
print product.price  # 999.99
```

## 3.3 Methods

### Instance Methods

```loto
class Counter
  value : number = 0

  def increment()
    @value = @value + 1
  end

  def decrement() : void
    @value = @value - 1
  end

  def get_value() : number
    @value
  end
end

# Usage
counter = new Counter
counter.increment()
print counter.get_value()  # 1
```

### Method Parameters and Return Types

```loto
class Calculator
  def add(a : number, b : number) : number
    a + b
  end

  def multiply(x : number, y : number) : number
    x * y
  end

  def is_positive(value : number) : boolean
    value > 0
  end
end
```

## 3.4 The `@` operator

The `@` symbol represents instance variables within class methods:

```loto
class Account
  balance : number
  owner : string

  def construct(owner, initial_balance)
    @owner = owner
    @balance = initial_balance
  end

  def deposit(amount : number)
    @balance = @balance + amount
  end

  def withdraw(amount : number) : boolean
    if @balance >= amount
      @balance = @balance - amount
      return true
    end
    false
  end

  def get_balance() : number
    @balance
  end
end
```

## 3.5 Constructors (`construct`)

The `construct` method is the class constructor:

```loto
class Wallet
  owner : string
  balance : number
  currency : string

  def construct(owner, balance, currency = "USD")
    @owner = owner
    @balance = balance
    @currency = currency
  end
end

# Create instances
wallet1 = new Wallet("Alice", 100)           # Uses default USD
wallet2 = new Wallet("Bob", 50, "EUR")       # Specifies EUR
```

### Constructor with Validation

```loto
class BankAccount
  account_number : string
  balance : number
  active : boolean

  def construct(account_number, initial_deposit)
    if initial_deposit < 0
      print "Error: Initial deposit cannot be negative"
      return
    end

    @account_number = account_number
    @balance = initial_deposit
    @active = true
  end
end
```

## 3.6 Special `print()` Method for CLI Output

Classes can define a special `print()` method that's automatically called when the object is passed to `print()`:

```loto
class User
  name : string
  email : string

  def construct(name, email)
    @name = name
    @email = email
  end

  def print() : string
    "User: #{@name} (#{@email})"
  end
end

# Usage
user = new User("Pablo", "pablo@example.com")
print user  # Automatically calls user.print()
# Output: "User: Pablo (pablo@example.com)"
```

### Advanced Print Method

```loto
class Transaction
  amount : number
  type : string
  timestamp : string

  def construct(amount, type)
    @amount = amount
    @type = type
    @timestamp = "2024-01-01"  # In real code, use current timestamp
  end

  def print() : string
    symbol = @type == "deposit" ? "+" : "-"
    "#{@timestamp}: #{symbol}#{@amount} (#{@type})"
  end
end

transaction = new Transaction(50.00, "deposit")
print transaction
# Output: "2024-01-01: +50 (deposit)"
```

## Complete Example: Wallet System

```loto
class User
  id : string
  name : string

  def construct(id, name)
    @id = id
    @name = name
  end

  def print() : string
    "User[#{@id}]: #{@name}"
  end
end

class Wallet
  owner : User
  balance : number
  active : boolean

  def construct(owner, balance)
    @owner = owner
    @balance = balance
    @active = true
  end

  def deposit(amount : number) : void
    if @active
      @balance = @balance + amount
    end
  end

  def withdraw(amount : number) : boolean
    if @active and @balance >= amount
      @balance = @balance - amount
      return true
    end
    false
  end

  def burn() : void
    @active = false
  end

  def print() : string
    status = @active ? "active" : "inactive"
    "Wallet: {#{@owner.name}} - #{@balance} EUR (#{status})"
  end
end

# Usage
def main
  user = new User("001", "Pablo")
  wallet = new Wallet(user, 1000)
  
  wallet.deposit(500)
  print wallet  # "Wallet: {Pablo} - 1500 EUR (active)"
  
  wallet.withdraw(200)
  print wallet  # "Wallet: {Pablo} - 1300 EUR (active)"
  
  wallet.burn()
  print wallet  # "Wallet: {Pablo} - 1300 EUR (inactive)"
end

main()
```

---

**Next:** [String Interpolation](04-string-interpolation.md)