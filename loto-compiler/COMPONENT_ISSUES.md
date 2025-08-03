# Component Implementation Issues & Fixes

Este documento registra todos los problemas encontrados durante la implementación de componentes React en Loto, junto con sus soluciones y tests necesarios.

## 1. Lexer: Indentación perdida después de líneas vacías

### Problema
El lexer no emitía tokens `indent` correctos después de líneas vacías, causando errores de parsing como:
```
Error: Expected indent but got {"kind":"newline"}
```

### Código problemático
```loto
component Counter
  props
    start : number = 0
  end

  state    # <- No se detectaba la indentación aquí
    count : number = start
  end
```

### Causa
En `src/lexer.js`, las líneas vacías hacían `continue` antes de procesar la indentación:
```javascript
// Skip empty lines and comments
if (!content || content.startsWith('#')) {
  push({ kind: 'newline' });
  continue; // <- Esto saltaba el procesamiento de indentación
}
```

### Solución Intentada
Movido el comentario para clarificar que las líneas vacías solo saltan el procesamiento de contenido, no la indentación.

### Estado Actual
✅ **PROBLEMA IDENTIFICADO** - El lexer está funcionando correctamente. 

### Causa Real
El problema no está en el lexer, sino en el parser. El parser espera un token `indent` antes de `state`, pero `state` está al mismo nivel de indentación que `props` (ambos con 2 espacios). El lexer correctamente no emite un nuevo `indent` porque ya está en ese nivel.

### Solución Real
Corregir el parser para que `state` sea tratado como bloque hermano de `props` dentro del componente, no como un bloque anidado que necesita indentación adicional.

### Test necesario
```javascript
it('should handle indentation correctly after empty lines', () => {
  const source = `component Test
  props
    start : number = 0
  end

  state
    count : number = start
  end`;
  
  const tokens = lex(source);
  // Verificar que hay un token 'indent' antes de 'state'
  const stateIndex = tokens.findIndex(t => t.kind === 'keyword' && t.value === 'state');
  const prevToken = tokens[stateIndex - 1];
  assert.strictEqual(prevToken.kind, 'indent');
});
```

## 2. Generator: State variables en componentes React

### Problema
Los métodos de componentes generaban código incorrecto para variables de estado:
```javascript
// Generado incorrectamente:
this.count = this.count + 1;

// Debería ser:
setCount(count + 1);
```

### Causa
El generador usaba la misma lógica de clases (`this.variable`) para componentes React.

### Solución
Creadas funciones específicas `generateComponentStatement` y `generateComponentExpression` que:
- Detectan variables de estado basándose en la definición del componente
- Usan setters de React Hook (`setCount`) en lugar de asignaciones directas
- Convierten `@count` a `count` en lugar de `this.count`

### Test necesario
```javascript
it('should generate correct React state setters', () => {
  const component = {
    kind: 'ComponentDeclaration',
    name: 'Counter',
    state: [{ name: 'count', type: 'number', initialValue: { kind: 'NumberLiteral', value: '0' } }],
    methods: [{
      kind: 'FunctionDeclaration',
      name: 'increment',
      body: [{
        kind: 'InstanceVarAssignment',
        variable: '@count',
        value: { kind: 'BinaryExpression', left: { kind: 'InstanceVar', name: '@count' }, operator: '+', right: { kind: 'NumberLiteral', value: '1' } }
      }]
    }]
  };
  
  const js = generate({ kind: 'Program', body: [component] });
  assert.ok(js.includes('setCount(count + 1)'));
  assert.ok(!js.includes('this.count'));
});
```

## 3. Parser: Token `state` sin token `indent` previo

### Problema
El parser esperaba un token `indent` antes de `state`, pero el lexer no lo emitía debido al problema #1.

### Estado actual
**PENDIENTE** - Necesita verificación después de arreglar el lexer.

### Test necesario
```javascript
it('should parse component with state block correctly', () => {
  const source = `component Counter
  state
    count : number = 0
  end
end`;
  
  const ast = parse(source);
  assert.strictEqual(ast.body[0].kind, 'ComponentDeclaration');
  assert.strictEqual(ast.body[0].state.length, 1);
  assert.strictEqual(ast.body[0].state[0].name, 'count');
});
```

## 4. Pendientes de implementación

### JSX Render Block Parsing
- [ ] Parsing de elementos JSX: `View.counter`, `Text(class="label")`
- [ ] Parsing de contenido JSX: `Text "Hello"`
- [ ] Parsing de children anidados
- [ ] Parsing de interpolación JSX: `{{@count}}`

### Event Handlers
- [ ] Parsing de sintaxis `on:press=@increment()`
- [ ] Generación de props React: `onPress={increment}`

### Style Block
- [ ] Parsing completo de reglas CSS
- [ ] Generación de objetos de estilo JavaScript
- [ ] Conversión de nombres CSS (backgroundColor vs background-color)

### Tests de integración
- [ ] Test completo del archivo `counter.loto`
- [ ] Test de generación de JSX completo
- [ ] Test de event handlers
- [ ] Test de styles

## Próximos pasos

1. Verificar que el fix del lexer resuelve el problema de indentación
2. Implementar parsing completo del render block
3. Implementar parsing de event handlers
4. Crear tests unitarios para cada problema documentado
5. Test de integración con el archivo completo `counter.loto`