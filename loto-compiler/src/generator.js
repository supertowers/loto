// generator.js
// Loto code generator - converts AST to JavaScript

export function generate(ast) {
  const output = [];
  
  // Add runtime helpers at the top
  output.push('// ---- Loto → JavaScript ----');
  output.push('');
  output.push('// Runtime helpers');
  output.push('function print(value) {');
  output.push('  console.log(value);');
  output.push('}');
  output.push('');
  output.push('function defined(value) {');
  output.push('  return value !== null && value !== undefined;');
  output.push('}');
  output.push('');
  
  // Generate code for each statement in the program
  for (const statement of ast.body) {
    generateStatement(statement, output, 0);
  }
  
  return output.join('\n');
}

function generateStatement(node, output, indent = 0) {
  const indentStr = '  '.repeat(indent);
  
  switch (node.kind) {
    case 'FunctionDeclaration':
      output.push(`${indentStr}function ${node.name}() {`);
      for (const stmt of node.body) {
        generateStatement(stmt, output, indent + 1);
      }
      output.push(`${indentStr}}`);
      output.push('');
      break;
      
    case 'PrintStatement':
      output.push(`${indentStr}print(${JSON.stringify(node.value)});`);
      break;
      
    case 'CallExpression':
      output.push(`${indentStr}${node.name}();`);
      break;
      
    case 'ReturnStatement':
      if (node.value) {
        output.push(`${indentStr}return ${generateExpression(node.value)};`);
      } else {
        output.push(`${indentStr}return;`);
      }
      break;
      
    default:
      throw new Error(`Unknown statement type: ${node.kind}`);
  }
}

function generateExpression(node) {
  switch (node.kind) {
    case 'StringLiteral':
      return JSON.stringify(node.value);
      
    case 'NumberLiteral':
      return node.value;
      
    case 'BooleanLiteral':
      return node.value ? 'true' : 'false';
      
    case 'NullLiteral':
      return 'null';
      
    case 'Identifier':
      return node.name;
      
    default:
      throw new Error(`Unknown expression type: ${node.kind}`);
  }
}