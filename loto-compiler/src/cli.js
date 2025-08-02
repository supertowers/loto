#!/usr/bin/env node

// cli.js
// Loto compiler command-line interface

import fs from 'fs';
import path from 'path';
import { parse } from './parser.js';
import { generate } from './generator.js';

const [, , command, filePath] = process.argv;

function showUsage() {
  console.log('Usage: loto <command> <file>');
  console.log('');
  console.log('Commands:');
  console.log('  run    <file.loto>    Run Loto file directly (interpreted)');
  console.log('  build  <file.loto>    Compile Loto file to JavaScript');
  console.log('  help                  Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  loto run hello.loto');
  console.log('  loto build hello.loto');
}

function main() {
  if (!command || command === 'help') {
    showUsage();
    process.exit(0);
  }

  if (!filePath) {
    console.error('Error: File path is required');
    showUsage();
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File "${filePath}" not found`);
    process.exit(1);
  }

  if (!filePath.endsWith('.loto')) {
    console.error('Error: File must have .loto extension');
    process.exit(1);
  }

  try {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const ast = parse(sourceCode);
    const jsCode = generate(ast);

    switch (command) {
      case 'run':
        // Execute the generated JavaScript directly
        eval(jsCode);
        break;

      case 'build':
        // Write the generated JavaScript to a file
        const outputPath = filePath.replace(/\.loto$/, '.js');
        fs.writeFileSync(outputPath, jsCode);
        console.log(`✓ Built ${outputPath}`);
        break;

      default:
        console.error(`Error: Unknown command "${command}"`);
        showUsage();
        process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();