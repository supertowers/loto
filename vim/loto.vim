" Vim syntax file
" Language: Loto
" Maintainer: Pablo López Torres <pablo@hexagon.sh>
" Latest Revision: 2025-08-02

if exists("b:current_syntax")
  finish
endif

" Keywords
syn keyword lotoKeyword def end class new print return
syn keyword lotoConditional if else elsif unless case when then
syn keyword lotoRepeat while for until in do
syn keyword lotoBoolean true false
syn keyword lotoConstant nil

" Types
syn keyword lotoType string number boolean void

" Comments
syn match lotoComment "#.*$"

" Strings
syn region lotoString start='"' end='"' skip='\\"' contains=lotoInterpolation
syn region lotoString start="'" end="'" skip="\\'"

" String interpolation
syn region lotoInterpolation matchgroup=lotoInterpolationDelimiter start='#{' end='}' contained contains=@lotoAll

" Numbers
syn match lotoNumber '\v<\d+>'
syn match lotoNumber '\v<\d+\.\d+>'

" Instance variables
syn match lotoInstanceVariable '@\w\+'

" Class variables
syn match lotoClassVariable '@@\w\+'

" Constants (uppercase identifiers)
syn match lotoConstant '\v<[A-Z][A-Z0-9_]*>'

" Method definitions
syn match lotoMethodDef '\v<def\s+\zs\w+>'

" Class definitions
syn match lotoClassDef '\v<class\s+\zs\w+>'

" Function calls
syn match lotoMethodCall '\v\w+\ze\s*\('

" Operators
syn match lotoOperator '\v(\+|\-|\*|\/|\%|\=\=|\!\=|\<|\>|\<\=|\>\=|\&\&|\|\||\!|\=)'

" Type annotations
syn match lotoTypeAnnotation '\v:\s*\zs\w+>'

" Define syntax clusters
syn cluster lotoAll contains=lotoKeyword,lotoConditional,lotoRepeat,lotoBoolean,lotoConstant,lotoType,lotoComment,lotoString,lotoNumber,lotoInstanceVariable,lotoClassVariable,lotoMethodDef,lotoClassDef,lotoMethodCall,lotoOperator,lotoTypeAnnotation

" Highlighting
hi def link lotoKeyword         Keyword
hi def link lotoConditional     Conditional
hi def link lotoRepeat          Repeat
hi def link lotoBoolean         Boolean
hi def link lotoConstant        Constant
hi def link lotoType            Type
hi def link lotoComment         Comment
hi def link lotoString          String
hi def link lotoInterpolation   Special
hi def link lotoInterpolationDelimiter Delimiter
hi def link lotoNumber          Number
hi def link lotoInstanceVariable Identifier
hi def link lotoClassVariable   Identifier
hi def link lotoMethodDef       Function
hi def link lotoClassDef        Type
hi def link lotoMethodCall      Function
hi def link lotoOperator        Operator
hi def link lotoTypeAnnotation  Type

let b:current_syntax = "loto"