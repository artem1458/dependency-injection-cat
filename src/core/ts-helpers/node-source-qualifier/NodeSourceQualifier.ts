import ts from 'typescript';
import { INodeSourceDescriptor } from '../node-source-descriptor';

export class NodeSourceQualifier {
    static qualify(sourceFile: ts.SourceFile, nameToFind: string): INodeSourceDescriptor | null {
        const splittedNameToFind = nameToFind.split('.');

        const namedExportBindings: ts.NamedExportBindings[] = [];
        const importDeclarations: ts.ImportDeclaration[] = [];

        sourceFile.statements.forEach(statement => {
            if (ts.isImportDeclaration(statement)) {
                importDeclarations.push(statement);
                return;
            }
        });

        return null;
    }
}
