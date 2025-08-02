// parser.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parse } from '../src/parser.js';

describe('Parser', () => {
  it('should parse simple function declaration without parentheses', () => {
    const source = `def main
  print "Hello, world!"
end`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 1);
    
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, null);
    assert.strictEqual(func.body.length, 1);
    
    const printStmt = func.body[0];
    assert.strictEqual(printStmt.kind, 'PrintStatement');
    assert.strictEqual(printStmt.value, 'Hello, world!');
  });

  it('should parse function declaration with parentheses and return type', () => {
    const source = `def main() : void
  print "Hello, world!"
end`;
    
    const ast = parse(source);
    
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, 'void');
    assert.strictEqual(func.body.length, 1);
  });

  it('should parse function call without parentheses', () => {
    const source = `def main
  print "Hello!"
end

main`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.body.length, 2);
    
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
    assert.strictEqual(call.arguments.length, 0);
  });

  it('should parse function call with parentheses', () => {
    const source = `def main
  print "Hello!"
end

main()`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.body.length, 2);
    
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
    assert.strictEqual(call.arguments.length, 0);
  });

  it('should parse complete hello world program', () => {
    const source = `# hello.loto
def main
  print "Hello, world!"
end

main()`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 2);
    
    // Function declaration
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, null);
    
    // Function call
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
  });

  it('should parse typed hello world program', () => {
    const source = `# hello_strict.loto
def main() : void
  print "Hello, world!"
end

main()`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 2);
    
    // Function declaration with type
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'main');
    assert.strictEqual(func.returnType, 'void');
    
    // Function call
    const call = ast.body[1];
    assert.strictEqual(call.kind, 'CallExpression');
    assert.strictEqual(call.name, 'main');
  });

  it('should handle empty programs', () => {
    const source = `# Just comments

# More comments`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 0);
  });

  it('should handle multiple statements in function body', () => {
    const source = `def test
  print "First line"
  print "Second line"
end`;
    
    const ast = parse(source);
    
    const func = ast.body[0];
    assert.strictEqual(func.body.length, 2);
    assert.strictEqual(func.body[0].kind, 'PrintStatement');
    assert.strictEqual(func.body[0].value, 'First line');
    assert.strictEqual(func.body[1].kind, 'PrintStatement');
    assert.strictEqual(func.body[1].value, 'Second line');
  });

  it('should parse class declarations', () => {
    const source = `class User
  name : string
  age : number
end`;
    
    const ast = parse(source);
    
    assert.strictEqual(ast.kind, 'Program');
    assert.strictEqual(ast.body.length, 1);
    
    const clazz = ast.body[0];
    assert.strictEqual(clazz.kind, 'ClassDeclaration');
    assert.strictEqual(clazz.name, 'User');
    assert.strictEqual(clazz.properties.length, 2);
    
    assert.strictEqual(clazz.properties[0].kind, 'PropertyDeclaration');
    assert.strictEqual(clazz.properties[0].name, 'name');
    assert.strictEqual(clazz.properties[0].type, 'string');
    
    assert.strictEqual(clazz.properties[1].kind, 'PropertyDeclaration');
    assert.strictEqual(clazz.properties[1].name, 'age');
    assert.strictEqual(clazz.properties[1].type, 'number');
  });

  it('should parse class with constructor', () => {
    const source = `class User
  name : string
  
  def construct(name)
    @name = name
  end
end`;
    
    const ast = parse(source);
    
    const clazz = ast.body[0];
    assert.strictEqual(clazz.kind, 'ClassDeclaration');
    assert.strictEqual(clazz.methods.length, 1);
    
    const constructor = clazz.methods[0];
    assert.strictEqual(constructor.kind, 'FunctionDeclaration');
    assert.strictEqual(constructor.name, 'construct');
    assert.strictEqual(constructor.parameters.length, 1);
    assert.strictEqual(constructor.parameters[0].name, 'name');
    
    const assignment = constructor.body[0];
    assert.strictEqual(assignment.kind, 'InstanceVarAssignment');
    assert.strictEqual(assignment.variable, '@name');
  });

  it('should parse object instantiation', () => {
    const source = `user = new User("Pablo")`;
    
    const ast = parse(source);
    
    const assignment = ast.body[0];
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.target, 'user');
    
    const newExpr = assignment.value;
    assert.strictEqual(newExpr.kind, 'NewExpression');
    assert.strictEqual(newExpr.className, 'User');
    assert.strictEqual(newExpr.arguments.length, 1);
    assert.strictEqual(newExpr.arguments[0].kind, 'StringLiteral');
    assert.strictEqual(newExpr.arguments[0].value, 'Pablo');
  });

  it('should parse property assignments', () => {
    const source = `user.name = "Pablo"`;
    
    const ast = parse(source);
    
    const assignment = ast.body[0];
    assert.strictEqual(assignment.kind, 'PropertyAssignment');
    assert.strictEqual(assignment.object, 'user');
    assert.strictEqual(assignment.properties.length, 1);
    assert.strictEqual(assignment.properties[0], 'name');
    assert.strictEqual(assignment.value.kind, 'StringLiteral');
    assert.strictEqual(assignment.value.value, 'Pablo');
  });

  it('should parse method calls', () => {
    const source = `result = wallet.show()
print wallet`;
    
    const ast = parse(source);
    
    // Method call assignment
    const assignment = ast.body[0];
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.value.kind, 'MethodCall');
    assert.strictEqual(assignment.value.object, 'wallet');
    assert.strictEqual(assignment.value.method, 'show');
    assert.strictEqual(assignment.value.arguments.length, 0);
    
    // Print with identifier
    const printStmt = ast.body[1];
    assert.strictEqual(printStmt.kind, 'PrintStatement');
    assert.strictEqual(printStmt.value.kind, 'Identifier');
    assert.strictEqual(printStmt.value.name, 'wallet');
  });

  it('should parse interpolated strings', () => {
    const source = `message = "Hello #{name}!"`;
    
    const ast = parse(source);
    
    const assignment = ast.body[0];
    assert.strictEqual(assignment.kind, 'Assignment');
    assert.strictEqual(assignment.value.kind, 'InterpolatedString');
    assert.strictEqual(assignment.value.value, 'Hello #{name}!');
  });

  it('should parse functions with parameters and return types', () => {
    const source = `def format(data : number) : string
  "#{data} eur"
end`;
    
    const ast = parse(source);
    
    const func = ast.body[0];
    assert.strictEqual(func.kind, 'FunctionDeclaration');
    assert.strictEqual(func.name, 'format');
    assert.strictEqual(func.returnType, 'string');
    assert.strictEqual(func.parameters.length, 1);
    assert.strictEqual(func.parameters[0].name, 'data');
    assert.strictEqual(func.parameters[0].type, 'number');
    
    // Should have return statement for single expression
    const returnStmt = func.body[0];
    assert.strictEqual(returnStmt.kind, 'ReturnStatement');
    assert.strictEqual(returnStmt.value.kind, 'InterpolatedString');
  });

  it('should parse instance variable access in expressions', () => {
    const source = `def test
  name = @owner.name
  balance = @balance
end`;
    
    const ast = parse(source);
    
    const func = ast.body[0];
    
    // @owner.name access
    const assignment1 = func.body[0];
    assert.strictEqual(assignment1.kind, 'Assignment');
    assert.strictEqual(assignment1.value.kind, 'InstanceVarAccess');
    assert.strictEqual(assignment1.value.variable, '@owner');
    assert.strictEqual(assignment1.value.properties.length, 1);
    assert.strictEqual(assignment1.value.properties[0], 'name');
    
    // @balance access
    const assignment2 = func.body[1];
    assert.strictEqual(assignment2.kind, 'Assignment');
    assert.strictEqual(assignment2.value.kind, 'InstanceVar');
    assert.strictEqual(assignment2.value.name, '@balance');
  });

  it('should parse complex wallet example structure', () => {
    const source = `class Wallet
  owner : User
  balance : number
  
  def construct(owner, balance)
    @owner = owner
    @balance = balance
  end
  
  def print() : string
    "Wallet: #{@owner.name} - #{@balance}"
  end
end`;
    
    const ast = parse(source);
    
    const clazz = ast.body[0];
    assert.strictEqual(clazz.kind, 'ClassDeclaration');
    assert.strictEqual(clazz.name, 'Wallet');
    assert.strictEqual(clazz.properties.length, 2);
    assert.strictEqual(clazz.methods.length, 2);
    
    // Constructor
    const constructor = clazz.methods[0];
    assert.strictEqual(constructor.name, 'construct');
    assert.strictEqual(constructor.parameters.length, 2);
    
    // Print method
    const printMethod = clazz.methods[1];
    assert.strictEqual(printMethod.name, 'print');
    assert.strictEqual(printMethod.returnType, 'string');
    assert.strictEqual(printMethod.body[0].kind, 'ReturnStatement');
    assert.strictEqual(printMethod.body[0].value.kind, 'InterpolatedString');
  });
});