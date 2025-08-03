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
      generateClass(node, output, indent);
      break;
      
    case 'ComponentDeclaration':
      generateComponent(node, output, indent);
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
      
    case 'IfStatement':
      output.push(`${indentStr}if (${generateExpression(node.condition)}) {`);
      for (const stmt of node.thenBlock) {
        generateStatement(stmt, output, indent + 1);
      }
      
      // Handle elsif blocks
      for (const elsif of node.elsifBlocks || []) {
        output.push(`${indentStr}} else if (${generateExpression(elsif.condition)}) {`);
        for (const stmt of elsif.body) {
          generateStatement(stmt, output, indent + 1);
        }
      }
      
      // Handle else block
      if (node.elseBlock && node.elseBlock.length > 0) {
        output.push(`${indentStr}} else {`);
        for (const stmt of node.elseBlock) {
          generateStatement(stmt, output, indent + 1);
        }
      }
      
      output.push(`${indentStr}}`);
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
      
    case 'InstanceMethodCall':
      const methodName = node.variable.slice(1); // Remove @ prefix
      const instanceMethodArgs = node.arguments.map(arg => generateExpression(arg)).join(', ');
      return `this.${methodName}(${instanceMethodArgs})`;
      
    case 'BinaryExpression':
      const left = generateExpression(node.left);
      const right = generateExpression(node.right);
      return `${left} ${node.operator} ${right}`;
      
    case 'JSXInterpolation':
      // Convert {{@count}} to {count} (removing @ prefix for state variables)
      let content = node.value.trim();
      content = content.replace(/@([a-zA-Z_][a-zA-Z0-9_]*)/g, '$1');
      return `{${content}}`;
      
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

function generateClass(node, output, indent) {
  const indentStr = '  '.repeat(indent);
  
  output.push(`${indentStr}class ${node.name} {`);
  
  // Constructor
  const constructor = node.methods.find(m => m.name === 'construct');
  if (constructor) {
    const params = constructor.parameters || [];
    const paramList = params.map(p => p.name || p).join(', ');
    output.push(`${indentStr}  constructor(${paramList}) {`);
    for (const stmt of constructor.body) {
      generateStatement(stmt, output, 2);
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
        generateStatement(stmt, output, 2);
      }
      output.push(`${indentStr}  }`);
      output.push('');
    }
  }
  
  output.push(`${indentStr}}`);
  output.push('');
}

function generateComponent(node, output, indent) {
  const indentStr = '  '.repeat(indent);
  
  // Generate React imports - only import useState if component has state
  if (node.state && node.state.length > 0) {
    output.push(`import React, { useState } from 'react';`);
  } else {
    output.push(`import React from 'react';`);
  }
  output.push('');
  
  // Generate component function
  const propsList = node.props.map(prop => {
    if (prop.defaultValue) {
      return `${prop.name} = ${generateExpression(prop.defaultValue)}`;
    }
    return prop.name;
  }).join(', ');
  
  output.push(`function ${node.name}({ ${propsList} }) {`);
  
  // Generate state hooks
  for (const stateItem of node.state) {
    const initialValue = stateItem.initialValue ? generateExpression(stateItem.initialValue) : 'null';
    output.push(`  const [${stateItem.name}, set${capitalize(stateItem.name)}] = useState(${initialValue});`);
  }
  
  if (node.state.length > 0) {
    output.push('');
  }
  
  // Generate methods as functions
  for (const method of node.methods) {
    const methodParams = (method.parameters || []).map(p => p.name || p).join(', ');
    output.push(`  const ${method.name} = (${methodParams}) => {`);
    for (const stmt of method.body) {
      generateComponentStatement(stmt, output, 2, node.state);
    }
    output.push(`  };`);
    output.push('');
  }
  
  // Generate render return
  if (node.renderBlock) {
    output.push('  return (');
    generateJSXElements(node.renderBlock.elements, 2, output);
    output.push('  );');
  } else {
    output.push('  return null;');
  }
  
  output.push('}');
  output.push('');
  
  // Generate styles if present
  if (node.styleBlock) {
    generateStyles(node.styleBlock, node.name, output);
  }
  
  output.push(`export default ${node.name};`);
}

function generateJSXElements(elements, indent, output) {
  const indentStr = '  '.repeat(indent);
  
  for (const element of elements) {
    if (element.kind === 'JSXElement') {
      let elementTag = element.name;
      let classNameAttr = '';
      
      if (element.className) {
        classNameAttr = ` className="${element.className}"`;
      }
      
      let attributes = '';
      if (element.attributes && element.attributes.length > 0) {
        attributes = ' ' + element.attributes.map(attr => {
          let attrName = attr.name;
          let value = generateExpression(attr.value);
          
          // Convert event handler syntax: on:press -> onPress
          if (attrName.startsWith('on:')) {
            const eventType = attrName.slice(3); // Remove 'on:'
            attrName = 'on' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
          }
          
          // Convert class to className for React
          if (attrName === 'class') {
            attrName = 'className';
          }
          
          // For event handlers with InstanceMethodCall, generate just the method name
          if (attr.value.kind === 'InstanceMethodCall' && attrName.startsWith('on')) {
            const methodName = attr.value.variable.slice(1); // Remove @ prefix
            value = methodName; // No parentheses, no this.
          }
          
          // For string literals, use quotes instead of braces
          if (attr.value.kind === 'StringLiteral') {
            return `${attrName}="${attr.value.value}"`;
          }
          
          return `${attrName}={${value}}`;
        }).join(' ');
      }
      
      if (element.children && element.children.length > 0) {
        // Check if all children are inline content (text/interpolation)
        const allInlineContent = element.children.every(child => 
          child.kind === 'JSXText' || child.kind === 'JSXInterpolation'
        );
        
        if (allInlineContent) {
          // Generate inline content
          let inlineContent = '';
          for (const child of element.children) {
            if (child.kind === 'JSXText') {
              inlineContent += child.value;
            } else if (child.kind === 'JSXInterpolation') {
              let content = child.value.trim();
              content = content.replace(/@([a-zA-Z_][a-zA-Z0-9_]*)/g, '$1'); // Remove @ prefix
              inlineContent += `{${content}}`;
            }
          }
          output.push(`${indentStr}<${elementTag}${classNameAttr}${attributes}>${inlineContent}</${elementTag}>`);
        } else {
          // Generate multiline content
          output.push(`${indentStr}<${elementTag}${classNameAttr}${attributes}>`);
          generateJSXElements(element.children, indent + 1, output);
          output.push(`${indentStr}</${elementTag}>`);
        }
      } else if (element.content) {
        output.push(`${indentStr}<${elementTag}${classNameAttr}${attributes}>${element.content}</${elementTag}>`);
      } else {
        output.push(`${indentStr}<${elementTag}${classNameAttr}${attributes} />`);
      }
    }
  }
}

function generateStyles(styleBlock, componentName, output) {
  output.push(`const styles = {`);
  
  for (const rule of styleBlock.rules) {
    output.push(`  ${rule.selector}: {`);
    for (const decl of rule.declarations) {
      const value = generateExpression(decl.value);
      output.push(`    ${decl.property}: ${value},`);
    }
    output.push(`  },`);
  }
  
  output.push(`};`);
  output.push('');
}

function generateComponentStatement(node, output, indent, stateVars) {
  const indentStr = '  '.repeat(indent);
  
  switch (node.kind) {
    case 'InstanceVarAssignment':
      const varName = node.variable.slice(1); // Remove @ prefix
      // Check if this is a state variable
      const stateVar = stateVars.find(s => s.name === varName);
      if (stateVar) {
        // Use state setter: setCount(count + 1)
        const setterName = `set${capitalize(varName)}`;
        const newValue = generateComponentExpression(node.value, stateVars);
        output.push(`${indentStr}${setterName}(${newValue});`);
      } else {
        // Regular instance variable
        output.push(`${indentStr}this.${varName} = ${generateComponentExpression(node.value, stateVars)};`);
      }
      break;
      
    case 'Assignment':
      output.push(`${indentStr}let ${node.target} = ${generateComponentExpression(node.value, stateVars)};`);
      break;
      
    case 'ReturnStatement':
      if (node.value) {
        output.push(`${indentStr}return ${generateComponentExpression(node.value, stateVars)};`);
      } else {
        output.push(`${indentStr}return;`);
      }
      break;
      
    default:
      // Fall back to regular statement generation
      generateStatement(node, output, indent);
      break;
  }
}

function generateComponentExpression(node, stateVars) {
  if (node.kind === 'InstanceVar') {
    const varName = node.name.slice(1); // Remove @ prefix
    // Check if this is a state variable
    const stateVar = stateVars.find(s => s.name === varName);
    if (stateVar) {
      return varName; // Just use the state variable name
    } else {
      return `this.${varName}`;
    }
  } else if (node.kind === 'BinaryExpression') {
    const left = generateComponentExpression(node.left, stateVars);
    const right = generateComponentExpression(node.right, stateVars);
    return `${left} ${node.operator} ${right}`;
  } else {
    // Fall back to regular expression generation
    return generateExpression(node);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}