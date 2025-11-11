# Syntax Tree Query Tool

A JavaScript script that allows you to query and analyze the Abstract Syntax Tree (AST) of JavaScript and TypeScript code files.

## Features

- Parse JavaScript, TypeScript, JSX, and TSX files
- Query specific node types (functions, variables, classes, imports, exports)
- Display node locations and source code
- Export full AST as JSON
- Command-line interface for easy usage

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Command Line

```bash
node syntax-tree-query.js <file-path> <query-type> [show-code]
```

#### Parameters:
- `file-path`: Path to the code file to analyze
- `query-type`: Type of nodes to query:
  - `functions` - Function declarations, expressions, and arrow functions
  - `variables` - Variable declarations
  - `classes` - Class declarations
  - `imports` - Import statements
  - `exports` - Export statements
  - `ast` - Full AST as JSON
- `show-code` (optional): Set to `true` or `yes` to show the source code for each node

#### Examples:

```bash
# Query all functions in a file
node syntax-tree-query.js example.js functions

# Query variables and show their code
node syntax-tree-query.js example.js variables true

# Get full AST as JSON
node syntax-tree-query.js example.js ast

# Query TypeScript file
node syntax-tree-query.js example.ts classes
```

### Programmatic Usage

```javascript
const SyntaxTreeQuery = require('./syntax-tree-query');

const query = new SyntaxTreeQuery();

// Parse a file
query.parseFile('example.js');

// Query specific node types
const functions = query.queryFunctions();
const variables = query.queryVariables();
const classes = query.queryClasses();

// Print node information
query.printNodeInfo(functions, true);

// Get full AST
const ast = query.getFullAST();
```

## Supported File Types

- JavaScript (.js)
- JavaScript JSX (.jsx)
- TypeScript (.ts)
- TypeScript TSX (.tsx)

## Dependencies

- @babel/parser - For parsing code into AST
- @babel/traverse - For traversing and querying AST nodes
- @babel/generator - For generating code from AST nodes

## Requirements

- Node.js >= 14.0.0

## Example Output

```
Found 2 function(s):

--- Node 1 ---
Type: FunctionDeclaration
Location: 5:0 - 8:1
Name: add
Code:
function add(a, b) {
  return a + b;
}

--- Node 2 ---
Type: ArrowFunctionExpression
Location: 10:13 - 10:25
Name: undefined
Code:
(x) => x * 2
```