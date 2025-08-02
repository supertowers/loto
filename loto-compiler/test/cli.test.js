// cli.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = './src/cli.js';
const TEST_DIR = './test/fixtures';

describe('CLI Integration', () => {
  // Helper to create test files
  function createTestFile(filename, content) {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
    const filePath = path.join(TEST_DIR, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  // Helper to clean up test files
  function cleanupTestFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const jsFile = filePath.replace('.loto', '.js');
    if (fs.existsSync(jsFile)) {
      fs.unlinkSync(jsFile);
    }
  }

  it('should show help when no arguments provided', () => {
    const output = execSync(`node ${CLI_PATH}`, { encoding: 'utf8' });
    
    assert.ok(output.includes('Usage: loto <command> <file>'));
    assert.ok(output.includes('Commands:'));
    assert.ok(output.includes('run'));
    assert.ok(output.includes('build'));
  });

  it('should show help with help command', () => {
    const output = execSync(`node ${CLI_PATH} help`, { encoding: 'utf8' });
    
    assert.ok(output.includes('Usage: loto <command> <file>'));
  });

  it('should run simple hello world program', () => {
    const testFile = createTestFile('test_hello.loto', `def main
  print "Hello, test!"
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('Hello, test!'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should run typed hello world program', () => {
    const testFile = createTestFile('test_hello_typed.loto', `def main() : void
  print "Hello, typed!"
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('Hello, typed!'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should build hello world program to JavaScript', () => {
    const testFile = createTestFile('test_build.loto', `def main
  print "Hello, build!"
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} build ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('✓ Built'));
      
      const jsFile = testFile.replace('.loto', '.js');
      assert.ok(fs.existsSync(jsFile));
      
      const jsContent = fs.readFileSync(jsFile, 'utf8');
      assert.ok(jsContent.includes('// ---- Loto → JavaScript ----'));
      assert.ok(jsContent.includes('function main() {'));
      assert.ok(jsContent.includes('print("Hello, build!");'));
      assert.ok(jsContent.includes('main();'));
      
      // Test that the generated JS actually runs
      const jsOutput = execSync(`node ${jsFile}`, { encoding: 'utf8' });
      assert.ok(jsOutput.includes('Hello, build!'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should error on non-existent file', () => {
    try {
      execSync(`node ${CLI_PATH} run non_existent.loto`, { encoding: 'utf8' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.stderr.includes('File "non_existent.loto" not found'));
    }
  });

  it('should error on file without .loto extension', () => {
    const testFile = createTestFile('test.txt', 'def main\nend');
    
    try {
      execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.stderr.includes('File must have .loto extension'));
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  it('should error on unknown command', () => {
    const testFile = createTestFile('test_unknown.loto', `def main
  print "test"
end`);
    
    try {
      execSync(`node ${CLI_PATH} unknown ${testFile}`, { encoding: 'utf8', stdio: 'pipe' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      // Check all possible locations for the error message
      const allOutput = (error.stdout || '') + (error.stderr || '') + (error.message || '');
      assert.ok(allOutput.includes('Unknown command "unknown"'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should handle syntax errors gracefully', () => {
    const testFile = createTestFile('test_syntax_error.loto', `def main
  print "unterminated string
end`);
    
    try {
      execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.stderr.includes('Error:'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should run class-based program with constructor', () => {
    const testFile = createTestFile('test_class.loto', `class User
  name : string
  
  def construct(name)
    @name = name
  end
  
  def print() : string
    "User: #{@name}"
  end
end

def main
  user = new User("Pablo")
  print user
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('User: Pablo'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should build and run interpolated string program', () => {
    const testFile = createTestFile('test_interpolate.loto', `def greet(name)
  message = "Hello #{name}!"
  print message
end

greet("World")`);
    
    try {
      // Test run command
      const runOutput = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(runOutput.includes('Hello World!'));
      
      // Test build command
      const buildOutput = execSync(`node ${CLI_PATH} build ${testFile}`, { encoding: 'utf8' });
      assert.ok(buildOutput.includes('✓ Built'));
      
      // Check generated JavaScript
      const jsFile = testFile.replace('.loto', '.js');
      const jsContent = fs.readFileSync(jsFile, 'utf8');
      assert.ok(jsContent.includes('`Hello ${name}!`'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should handle method calls with parameters', () => {
    const testFile = createTestFile('test_math.loto', `def add(a, b)
  a + b
end

def main
  result = add(5, 3)
  print "Result: #{result}"
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('Result: 8'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should handle property assignments and access', () => {
    const testFile = createTestFile('test_counter.loto', `class Counter
  value : number
  
  def construct()
    @value = 0
  end
  
  def increment()
    @value = @value + 1
  end
  
  def print() : string
    "Count: #{@value}"
  end
end

def main
  counter = new Counter()
  counter.increment()
  counter.increment()
  print counter
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('Count: 2'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should handle custom print methods correctly', () => {
    const testFile = createTestFile('test_person.loto', `class Person
  name : string
  age : number
  
  def construct(name, age)
    @name = name
    @age = age
  end
  
  def print() : string
    "#{@name} (#{@age} years old)"
  end
end

def main
  person = new Person("Alice", 30)
  print person
  print "Direct string"
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('Alice (30 years old)'));
      assert.ok(output.includes('Direct string'));
    } finally {
      cleanupTestFile(testFile);
    }
  });

  it('should handle complex nested expressions', () => {
    const testFile = createTestFile('test_account.loto', `def format(amount)
  "#{amount} USD"
end

class Account
  owner : string
  balance : number
  
  def construct(owner, balance)
    @owner = owner
    @balance = balance
  end
  
  def print() : string
    "Account[#{@owner}]: #{format(@balance)}"
  end
end

def main
  account = new Account("Bob", 1500)
  print account
end

main()`);
    
    try {
      const output = execSync(`node ${CLI_PATH} run ${testFile}`, { encoding: 'utf8' });
      assert.ok(output.includes('Account[Bob]: 1500 USD'));
    } finally {
      cleanupTestFile(testFile);
    }
  });
});