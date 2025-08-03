// lexer-punctuation.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lex } from '../src/lexer.js';

describe('Lexer Punctuation', () => {
  it('should tokenize exclamation marks', () => {
    const tokens = lex('Text Welcome!');
    
    const exclamationToken = tokens.find(t => t.kind === 'symbol' && t.value === '!');
    assert.ok(exclamationToken, 'Should tokenize ! as symbol');
  });

  it('should tokenize question marks', () => {
    const tokens = lex('Text Are you sure?');
    
    const questionToken = tokens.find(t => t.kind === 'symbol' && t.value === '?');
    assert.ok(questionToken, 'Should tokenize ? as symbol');
  });

  it('should tokenize semicolons', () => {
    const tokens = lex('let x = 5;');
    
    const semicolonToken = tokens.find(t => t.kind === 'symbol' && t.value === ';');
    assert.ok(semicolonToken, 'Should tokenize ; as symbol');
  });

  it('should handle mixed punctuation in JSX content', () => {
    const tokens = lex('Text Hello, world! Are you ready?');
    
    const commaToken = tokens.find(t => t.kind === 'symbol' && t.value === ',');
    const exclamationToken = tokens.find(t => t.kind === 'symbol' && t.value === '!');
    const questionToken = tokens.find(t => t.kind === 'symbol' && t.value === '?');
    
    assert.ok(commaToken, 'Should tokenize comma');
    assert.ok(exclamationToken, 'Should tokenize exclamation');
    assert.ok(questionToken, 'Should tokenize question mark');
  });
});