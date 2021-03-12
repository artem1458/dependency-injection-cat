import ts from 'typescript';
import { INodeSourceDescriptor } from '../node-source-descriptor';
import { get } from 'lodash';

export class NodeSourceQualifier {
    static qualify(sourceFile: ts.SourceFile, nameToFind: string): INodeSourceDescriptor | null {
        const splittedNameToFind = nameToFind.split('.');

        //Find in top named export statements
        const nodeFromNamedExportStatements = this.getNodeByNameFromStatement(
            sourceFile.statements.filter(this.isNamedExportStatement),
            splittedNameToFind[0]
        );
        if (nodeFromNamedExportStatements !== null) {
            return {
                name: splittedNameToFind[0],
                path: sourceFile.fileName,
                node: nodeFromNamedExportStatements,
            };
        }

        //Find in export declarations -- export { A as B } ?from 'module-specifier';
        const exportDeclarationsFromCurrentFile: ExportDeclarationWithoutModuleSpecifier[] = [];
        const exportDeclarationsFromAnotherFile: ExportDeclarationWithModuleSpecifier[] = [];

        sourceFile.statements.forEach(node => {
            if (this.isExportDeclarationWithModuleSpecifier(node)) {
                exportDeclarationsFromAnotherFile.push(node);
            }
            if (this.isExportDeclarationWithoutModuleSpecifier(node)) {
                exportDeclarationsFromCurrentFile.push(node);
            }
        });

        //Find in export declarations in current file
        const exportDeclarationFromCurrentFile = exportDeclarationsFromCurrentFile;

        return null;
    }

    private static getNodeByNameFromStatement(statements: NamedExportStatement[], nameToFind: string): NamedExportStatement | null {
        return statements.find(it => it.name.getText() === nameToFind) ?? null;
    }

    private static isNamedExportStatement(node: ts.Statement): node is NamedExportStatement {
        return Boolean(get(node, 'name') && node.modifiers?.some(it => it.kind === ts.SyntaxKind.ExportKeyword));
    }

    private static isExportDeclarationWithModuleSpecifier(node: ts.Node): node is ExportDeclarationWithModuleSpecifier {
        return ts.isExportDeclaration(node) && Boolean(node.moduleSpecifier);
    }

    private static isExportDeclarationWithoutModuleSpecifier(node: ts.Node): node is ExportDeclarationWithoutModuleSpecifier {
        return ts.isExportDeclaration(node) && !node.moduleSpecifier;
    }
}

interface NamedExportStatement extends NamedStatement {
    modifiers: [ts.ExportKeyword] & ts.ModifiersArray
}

export interface NamedStatement extends ts.Statement {
    name: ts.Identifier;
}

export interface ExportDeclarationWithoutModuleSpecifier extends ts.ExportDeclaration {
    moduleSpecifier: undefined
}
export interface ExportDeclarationWithModuleSpecifier extends ts.ExportDeclaration {
    moduleSpecifier: ts.Expression
}
