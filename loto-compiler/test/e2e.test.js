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
});