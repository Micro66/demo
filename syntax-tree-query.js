#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

class SyntaxTreeQuery {
    constructor() {
        this.ast = null;
        this.sourceCode = null;
    }

    parseFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);

            if (!fs.existsSync(absolutePath)) {
                throw new Error(`File not found: ${absolutePath}`);
            }

            this.sourceCode = fs.readFileSync(absolutePath, 'utf8');

            const ext = path.extname(absolutePath).toLowerCase();
            let plugins = [];

            if (ext === '.ts' || ext === '.tsx') {
                plugins.push('typescript');
                if (ext === '.tsx') {
                    plugins.push('jsx');
                }
            } else if (ext === '.jsx') {
                plugins.push('jsx');
            }

            this.ast = parse(this.sourceCode, {
                sourceType: 'module',
                plugins: plugins,
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true,
                plugins: plugins
            });

            return this.ast;
        } catch (error) {
            throw new Error(`Failed to parse file: ${error.message}`);
        }
    }

    queryNodes(nodeType) {
        if (!this.ast) {
            throw new Error('No AST available. Please parse a file first.');
        }

        const nodes = [];

        traverse(this.ast, {
            [nodeType]: (path) => {
                nodes.push({
                    node: path.node,
                    loc: path.node.loc,
                    start: path.node.start,
                    end: path.node.end
                });
            }
        });

        return nodes;
    }

    queryFunctions() {
        return this.queryNodes('FunctionDeclaration')
            .concat(this.queryNodes('FunctionExpression'))
            .concat(this.queryNodes('ArrowFunctionExpression'));
    }

    queryVariables() {
        return this.queryNodes('VariableDeclarator');
    }

    queryClasses() {
        return this.queryNodes('ClassDeclaration');
    }

    queryImports() {
        return this.queryNodes('ImportDeclaration');
    }

    queryExports() {
        return this.queryNodes('ExportNamedDeclaration')
            .concat(this.queryNodes('ExportDefaultDeclaration'));
    }

    getNodeCode(nodeInfo) {
        if (!nodeInfo || !nodeInfo.node) return '';

        try {
            const generated = generator(nodeInfo.node, {
                compact: false,
                comments: true
            });
            return generated.code;
        } catch (error) {
            return '';
        }
    }

    printNodeInfo(nodes, showCode = false) {
        nodes.forEach((nodeInfo, index) => {
            console.log(`\n--- Node ${index + 1} ---`);
            console.log(`Type: ${nodeInfo.node.type}`);
            console.log(`Location: ${nodeInfo.loc.start.line}:${nodeInfo.loc.start.column} - ${nodeInfo.loc.end.line}:${nodeInfo.loc.end.column}`);

            if (nodeInfo.node.id && nodeInfo.node.id.name) {
                console.log(`Name: ${nodeInfo.node.id.name}`);
            }

            if (showCode) {
                const code = this.getNodeCode(nodeInfo);
                if (code) {
                    console.log(`Code:\n${code}`);
                }
            }
        });
    }

    getFullAST() {
        return this.ast;
    }

    getSourceCode() {
        return this.sourceCode;
    }
}

function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node syntax-tree-query.js <file-path> <query-type> [show-code]');
        console.log('Query types: functions, variables, classes, imports, exports, ast');
        console.log('Example: node syntax-tree-query.js example.js functions true');
        process.exit(1);
    }

    const filePath = args[0];
    const queryType = args[1].toLowerCase();
    const showCode = args[2] === 'true' || args[2] === 'yes';

    const query = new SyntaxTreeQuery();

    try {
        query.parseFile(filePath);

        switch (queryType) {
            case 'functions':
                const functions = query.queryFunctions();
                console.log(`Found ${functions.length} function(s):`);
                query.printNodeInfo(functions, showCode);
                break;

            case 'variables':
                const variables = query.queryVariables();
                console.log(`Found ${variables.length} variable(s):`);
                query.printNodeInfo(variables, showCode);
                break;

            case 'classes':
                const classes = query.queryClasses();
                console.log(`Found ${classes.length} class(es):`);
                query.printNodeInfo(classes, showCode);
                break;

            case 'imports':
                const imports = query.queryImports();
                console.log(`Found ${imports.length} import(s):`);
                query.printNodeInfo(imports, showCode);
                break;

            case 'exports':
                const exports = query.queryExports();
                console.log(`Found ${exports.length} export(s):`);
                query.printNodeInfo(exports, showCode);
                break;

            case 'ast':
                const ast = query.getFullAST();
                console.log('Full AST:');
                console.log(JSON.stringify(ast, null, 2));
                break;

            default:
                console.log(`Unknown query type: ${queryType}`);
                console.log('Available types: functions, variables, classes, imports, exports, ast');
                process.exit(1);
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SyntaxTreeQuery;