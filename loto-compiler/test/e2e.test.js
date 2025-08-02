// e2e.test.js
// End-to-end tests for the complete Loto workflow

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import fs from 'fs';

const CLI_PATH = './src/cli.js';

describe('End-to-End Tests', () => {
  it('should compile and run the basic hello.loto example', () => {
    // Test interpreted execution
    const runOutput = execSync(`node ${CLI_PATH} run examples/hello.loto`, { encoding: 'utf8' });
    assert.strictEqual(runOutput.trim(), 'Hello, world!');
    
    // Test compilation
    const buildOutput = execSync(`node ${CLI_PATH} build examples/hello.loto`, { encoding: 'utf8' });
    assert.ok(buildOutput.includes('✓ Built examples/hello.js'));
    
    // Verify the JS file was created
    assert.ok(fs.existsSync('examples/hello.js'));
    
    // Test running the compiled JS
    const jsOutput = execSync('node examples/hello.js', { encoding: 'utf8' });
    assert.strictEqual(jsOutput.trim(), 'Hello, world!');
    
    // Verify the generated JS contains expected structure
    const jsContent = fs.readFileSync('examples/hello.js', 'utf8');
    assert.ok(jsContent.includes('// ---- Loto → JavaScript ----'));
    assert.ok(jsContent.includes('function print(value) {'));
    assert.ok(jsContent.includes('function defined(value) {'));
    assert.ok(jsContent.includes('function main() {'));
    assert.ok(jsContent.includes('print("Hello, world!");'));
    assert.ok(jsContent.includes('main();'));
  });

  it('should compile and run the typed hello_strict.loto example', () => {
    // Test interpreted execution
    const runOutput = execSync(`node ${CLI_PATH} run examples/hello_strict.loto`, { encoding: 'utf8' });
    assert.strictEqual(runOutput.trim(), 'Hello, world!');
    
    // Test compilation
    const buildOutput = execSync(`node ${CLI_PATH} build examples/hello_strict.loto`, { encoding: 'utf8' });
    assert.ok(buildOutput.includes('✓ Built examples/hello_strict.js'));
    
    // Verify the JS file was created
    assert.ok(fs.existsSync('examples/hello_strict.js'));
    
    // Test running the compiled JS
    const jsOutput = execSync('node examples/hello_strict.js', { encoding: 'utf8' });
    assert.strictEqual(jsOutput.trim(), 'Hello, world!');
    
    // Verify the generated JS contains expected structure (same as untyped for now)
    const jsContent = fs.readFileSync('examples/hello_strict.js', 'utf8');
    assert.ok(jsContent.includes('function main() {'));
    assert.ok(jsContent.includes('print("Hello, world!");'));
    assert.ok(jsContent.includes('main();'));
  });

  it('should produce identical output for typed and untyped versions', () => {
    // Both versions should produce the same runtime behavior
    const basicOutput = execSync(`node ${CLI_PATH} run examples/hello.loto`, { encoding: 'utf8' });
    const typedOutput = execSync(`node ${CLI_PATH} run examples/hello_strict.loto`, { encoding: 'utf8' });
    
    assert.strictEqual(basicOutput, typedOutput);
  });

  it('should handle the complete development workflow', () => {
    // 1. Run the untyped version for rapid prototyping
    const prototypeOutput = execSync(`node ${CLI_PATH} run examples/hello.loto`, { encoding: 'utf8' });
    assert.ok(prototypeOutput.includes('Hello, world!'));
    
    // 2. Add types and run the strict version
    const typedOutput = execSync(`node ${CLI_PATH} run examples/hello_strict.loto`, { encoding: 'utf8' });
    assert.ok(typedOutput.includes('Hello, world!'));
    
    // 3. Compile for production
    execSync(`node ${CLI_PATH} build examples/hello_strict.loto`);
    
    // 4. Deploy the compiled JS
    const productionOutput = execSync('node examples/hello_strict.js', { encoding: 'utf8' });
    assert.ok(productionOutput.includes('Hello, world!'));
    
    // All stages should produce the same result
    assert.strictEqual(prototypeOutput.trim(), typedOutput.trim());
    assert.strictEqual(typedOutput.trim(), productionOutput.trim());
  });

  it('should demonstrate the Loto language features', () => {
    // Test Ruby-like syntax without parentheses
    const basicContent = fs.readFileSync('examples/hello.loto', 'utf8');
    assert.ok(basicContent.includes('def main'));  // No parentheses
    assert.ok(basicContent.includes('end'));       // Ruby-like end
    assert.ok(basicContent.includes('main()'));    // Call with parentheses
    
    // Test optional type annotations
    const typedContent = fs.readFileSync('examples/hello_strict.loto', 'utf8');
    assert.ok(typedContent.includes('def main() : void')); // Type annotation
    assert.ok(typedContent.includes('void'));              // Lowercase primitive type
    
    // Test comment support
    assert.ok(basicContent.includes('#'));
    assert.ok(typedContent.includes('#'));
  });

  it('should run complete wallet example with object-oriented features', () => {
    // Create a comprehensive wallet program to test all OOP features
    const walletProgram = `# wallet_test.loto
def format(data : number) : string
  "#{data} eur"
end

class User
  id : string
  name : string
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

  def burn() : void
    @active = false
  end

  def print() : string
    "Wallet: {#{@owner.name}} - #{format(@balance)}"
  end
end

def main
  user = new User
  user.id = "0001"
  user.name = "Pablo"

  wallet = new Wallet(user, 1000)
  print wallet
end

main()`;
    
    // Write test file
    fs.writeFileSync('test_wallet_e2e.loto', walletProgram);
    
    try {
      // Test interpreted execution
      const runOutput = execSync(`node ${CLI_PATH} run test_wallet_e2e.loto`, { encoding: 'utf8' });
      assert.ok(runOutput.includes('Wallet: {Pablo} - 1000 eur'));
      
      // Test compilation
      const buildOutput = execSync(`node ${CLI_PATH} build test_wallet_e2e.loto`, { encoding: 'utf8' });
      assert.ok(buildOutput.includes('✓ Built test_wallet_e2e.js'));
      
      // Test running compiled JS
      const jsOutput = execSync('node test_wallet_e2e.js', { encoding: 'utf8' });
      assert.ok(jsOutput.includes('Wallet: {Pablo} - 1000 eur'));
      
      // Verify generated JS contains class and interpolation features
      const jsContent = fs.readFileSync('test_wallet_e2e.js', 'utf8');
      assert.ok(jsContent.includes('class User'));
      assert.ok(jsContent.includes('class Wallet'));
      assert.ok(jsContent.includes('constructor(owner, balance)'));
      assert.ok(jsContent.includes('this.owner = owner'));
      assert.ok(jsContent.includes('this.balance = balance'));
      assert.ok(jsContent.includes('new User()'));
      assert.ok(jsContent.includes('new Wallet(user, 1000)'));
      assert.ok(jsContent.includes('`Wallet: {${this.owner.name}} - ${format(this.balance)}`'));
    } finally {
      // Clean up test files
      if (fs.existsSync('test_wallet_e2e.loto')) {
        fs.unlinkSync('test_wallet_e2e.loto');
      }
      if (fs.existsSync('test_wallet_e2e.js')) {
        fs.unlinkSync('test_wallet_e2e.js');
      }
    }
  });

  it('should handle complex interpolation and nested property access', () => {
    const complexProgram = `# complex_interpolation.loto
class Profile
  firstName : string
  lastName : string
  
  def construct(first, last)
    @firstName = first
    @lastName = last
  end
end

class Employee
  profile : Profile
  salary : number
  
  def construct(profile, salary)
    @profile = profile
    @salary = salary
  end
  
  def print() : string
    "Employee: #{@profile.firstName} #{@profile.lastName} - $#{@salary}"
  end
end

def main
  profile = new Profile("John", "Doe")
  employee = new Employee(profile, 75000)
  print employee
end

main()`;
    
    // Write test file
    fs.writeFileSync('test_complex_e2e.loto', complexProgram);
    
    try {
      // Test interpreted execution
      const runOutput = execSync(`node ${CLI_PATH} run test_complex_e2e.loto`, { encoding: 'utf8' });
      assert.ok(runOutput.includes('Employee: John Doe - $75000'));
      
      // Test compilation
      const buildOutput = execSync(`node ${CLI_PATH} build test_complex_e2e.loto`, { encoding: 'utf8' });
      assert.ok(buildOutput.includes('✓ Built test_complex_e2e.js'));
      
      // Test running compiled JS
      const jsOutput = execSync('node test_complex_e2e.js', { encoding: 'utf8' });
      assert.ok(jsOutput.includes('Employee: John Doe - $75000'));
      
      // Verify complex interpolation was compiled correctly
      const jsContent = fs.readFileSync('test_complex_e2e.js', 'utf8');
      assert.ok(jsContent.includes('${this.profile.firstName}'));
      assert.ok(jsContent.includes('${this.profile.lastName}'));
      assert.ok(jsContent.includes('${this.salary}'));
    } finally {
      // Clean up test files
      if (fs.existsSync('test_complex_e2e.loto')) {
        fs.unlinkSync('test_complex_e2e.loto');
      }
      if (fs.existsSync('test_complex_e2e.js')) {
        fs.unlinkSync('test_complex_e2e.js');
      }
    }
  });
});