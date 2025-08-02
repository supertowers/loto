// generator.js
// Loto code generator - converts AST to JavaScript

export function generate(ast) {
  const output = [];
  
  // Add runtime helpers at the top
  output.push('// ---- Loto → JavaScript ----');
  output.push('');
  output.push('// Runtime helpers');
  output.push('function print(value) {');
  output.push('  // If the value has a print method, call it');
  output.push('  if (value && typeof value.print === "function") {');
  output.push('    console.log(value.print());');
  output.push('  } else {');
  output.push('    console.log(value);');
  output.push('  }');
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
      const params = (node.parameters || []).map(p => p.name || p).join(', ');
      output.push(`${indentStr}function ${node.name}(${params}) {`);
      for (const stmt of node.body) {
        generateStatement(stmt, output, indent + 1);
      }
      output.push(`${indentStr}}`);
      output.push('');
      break;
      
    case 'ClassDeclaration':
      output.push(`${indentStr}class ${node.name} {`);
      
      // Constructor
      const constructor = node.methods.find(m => m.name === 'construct');
      if (constructor) {
        // TODO: Handle constructor parameters properly
        const params = constructor.parameters || [];
        const paramList = params.map(p => p.name || p).join(', ');
        output.push(`${indentStr}  constructor(${paramList}) {`);
        for (const stmt of constructor.body) {
          generateStatement(stmt, output, indent + 2);
        }
        output.push(`${indentStr}  }`);
        output.push('');
      }
      
      // Other methods
      for (const method of node.methods) {
        if (method.name !== 'construct') {
          const methodParams = (method.parameters || []).map(p => p.name || p).join(', ');
          output.push(`${indentStr}  ${method.name}(${methodParams}) {`);
          for (const stmt of method.body) {
            generateStatement(stmt, output, indent + 2);
          }
          output.push(`${indentStr}  }`);
          output.push('');
        }
      }
      
      output.push(`${indentStr}}`);
      output.push('');
      break;
      
    case 'Assignment':
      output.push(`${indentStr}let ${node.target} = ${generateExpression(node.value)};`);
      break;
      
    case 'PropertyAssignment':
      const propChain = [node.object, ...node.properties].join('.');
      output.push(`${indentStr}${propChain} = ${generateExpression(node.value)};`);
      break;
      
    case 'InstanceVarAssignment':
      const varName = node.variable.slice(1); // Remove @ prefix
      output.push(`${indentStr}this.${varName} = ${generateExpression(node.value)};`);
      break;
      
    case 'PrintStatement':
      if (typeof node.value === 'string') {
        // Simple string literal
        output.push(`${indentStr}print(${JSON.stringify(node.value)});`);
      } else {
        // Expression
        output.push(`${indentStr}print(${generateExpression(node.value)});`);
      }
      break;
      
    case 'CallExpression':
      const callArgs = node.arguments.map(arg => generateExpression(arg)).join(', ');
      output.push(`${indentStr}${node.name}(${callArgs});`);
      break;
      
    case 'MethodCall':
      const methodArgs = node.arguments.map(arg => generateExpression(arg)).join(', ');
      output.push(`${indentStr}${node.object}.${node.method}(${methodArgs});`);
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
      
    case 'InterpolatedString':
      return generateInterpolatedString(node.value);
      
    case 'NumberLiteral':
      return node.value;
      
    case 'BooleanLiteral':
      return node.value ? 'true' : 'false';
      
    case 'NullLiteral':
      return 'null';
      
    case 'Identifier':
      return node.name;
      
    case 'NewExpression':
      const args = node.arguments.map(arg => generateExpression(arg)).join(', ');
      return `new ${node.className}(${args})`;
      
    case 'PropertyAccess':
      return [node.object, ...node.properties].join('.');
      
    case 'CallExpression':
      const callArgs = node.arguments.map(arg => generateExpression(arg)).join(', ');
      return `${node.name}(${callArgs})`;
      
    case 'MethodCall':
      const methodArgs = node.arguments.map(arg => generateExpression(arg)).join(', ');
      return `${node.object}.${node.method}(${methodArgs})`;
      
    case 'InstanceVar':
      const varName = node.name.slice(1); // Remove @ prefix
      return `this.${varName}`;
      
    case 'InstanceVarAccess':
      const instanceVarName = node.variable.slice(1); // Remove @ prefix
      return `this.${instanceVarName}.${node.properties.join('.')}`;
      
    case 'BinaryExpression':
      const left = generateExpression(node.left);
      const right = generateExpression(node.right);
      return `${left} ${node.operator} ${right}`;
      
    default:
      throw new Error(`Unknown expression type: ${node.kind}`);
  }
}

function generateInterpolatedString(template) {
  // Convert "Hello #{name}" to `Hello ${name}`
  // Handle @variable -> this.variable conversion
  let result = template.replace(/#{([^}]+)}/g, (match, expression) => {
    let processedExpression = expression.trim();
    
    // Handle function calls with @variables as arguments: format(@balance) -> format(this.balance)
    processedExpression = processedExpression.replace(/@([a-zA-Z_][a-zA-Z0-9_]*)/g, 'this.$1');
    
    return '${' + processedExpression + '}';
  });
  return '`' + result + '`';
}