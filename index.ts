// import * as ts from 'typescript';
//
// const source = `
//   const two = 2;
//   const four = 4;
//
//   const obj = {
//     value: 1232,
//   };
//
//   get();
// `;
//
// function transformer<T extends ts.SourceFile>(): ts.TransformerFactory<ts.SourceFile> {
//     return context => {
//         const visit: ts.Visitor = node => {
//             if (ts.isCallExpression(node) && node.expression.getText() === 'get') {
//                 return ts.createCall(
//                     ts.createIdentifier('aa'),
//                     [],
//                     [],
//                 )
//             }
//             return ts.visitEachChild(node, child => visit(child), context);
//         };
//
//         return node => {
//           let sourceFile = ts.visitNode(node, visit);
//
//           sourceFile = ts.updateSourceFileNode(sourceFile, [
//             ts.createImportDeclaration(
//                 [],
//                 [],
//                 undefined,
//                 ts.createStringLiteral('./ttt.ts'),
//             ),
//             ...sourceFile.statements,
//           ]);
//
//           return sourceFile;
//         };
//     };
// }
//
// let result = ts.transpileModule(source, {
//     compilerOptions: {module: ts.ModuleKind.CommonJS},
//     transformers: {before: [transformer()]}
// });
//
// const elem = document.createElement('div');
// elem.innerHTML = result.outputText;
// eval(result.outputText);
// document.body.appendChild(elem);

const two = 2;
const four = 4;

const obj = {
    value: 1232,
};

// @ts-ignore
ddd.get();
