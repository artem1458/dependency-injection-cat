import * as ts from 'typescript';
import { get } from 'lodash';
import { TypeQualifierError } from './TypeQualifierError';
import { isHasTypeNode } from '../utils/isHasTypeNode';
import { TNamedAvailableTypes } from './types';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';

export function typeIdQualifier(typeChecker: ts.TypeChecker, node: ts.Node): string {
    if (!isHasTypeNode(node) || node.type === undefined) {
        throw new Error(TypeQualifierError.HasNoType);
    }

    if (!ts.isTypeReferenceNode(node.type)) {
        throw new Error(TypeQualifierError.TypeIsPrimitive);
    }

    if (node.type.typeName === undefined) {
        throw new Error('No typeName found');
    }

    const referTypeName = node.type.typeName.getText();
    const leftSideName = referTypeName.split('.')[0];
    const typeName = getBaseTypeNameAndPath(node, leftSideName, referTypeName);

    if (typeName === undefined) {
        throw new Error('Can not generate id for type reference');
    }

    return typeName;
}

function getBaseTypeNameAndPath(node: ts.Node, nameToFind: string, referTypeName: string): string | undefined {
    const sourceFile = node.getSourceFile();
    const typeFromImport = getBaseTypeNameAndPathFromImport(sourceFile, referTypeName);

    if (typeFromImport) {
        return `${typeFromImport.path}_${typeFromImport.name}`;
    }

    const statement = findStatement(sourceFile.statements, nameToFind);

    if (statement === undefined) {
        return undefined;
    }

    return `${sourceFile.fileName}_${referTypeName}`;
}

function findStatement(statements: ts.NodeArray<ts.Statement>, nameToFind: string): ts.Statement | undefined {
    const namedStatements = statements.filter(isNamedStatement);

    return namedStatements.find(it => it.name.escapedText === nameToFind);
}

function isNamedStatement(statement: ts.Statement): statement is TNamedAvailableTypes {
    switch (statement.kind) {
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
        case ts.SyntaxKind.NamespaceExportDeclaration:
        case ts.SyntaxKind.ModuleDeclaration:
            return get(statement, 'name') !== undefined;
        default:
            return false;
    }
}

interface ITypeNamePath {
    name: string;
    path: string;
}

function getBaseTypeNameAndPathFromImport(sourceFile: ts.SourceFile, referTypeName: string): ITypeNamePath | undefined {
    const nameToFind = referTypeName.split('.')[0];
    const rightPartOfReferName = referTypeName.split('.').slice(1).join('.');
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);

    let result: ITypeNamePath | undefined;

    for (let i = 0; i < imports.length; i++){
        let imp = imports[i];
        const importPath = removeQuotesFromString(imp.moduleSpecifier.getText()); //TODO absolutize import path (with nearest tsconfig)
        if (imp.importClause === undefined) {
            continue;
        }

        if (imp.importClause.name && imp.importClause.name.escapedText === nameToFind) {
            result = {
                name: 'default_import',
                path: importPath,
            }
            break;
        }

        const namedBindings = imp.importClause.namedBindings;
        if (namedBindings === undefined) {
            continue;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamespaceImport && namedBindings.name.escapedText === nameToFind) {
            result = {
                name: nameToFind,
                path: importPath,
            }
            break;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
            namedBindings.elements.forEach(it => {
                if (it.name.escapedText === nameToFind && it.propertyName !== undefined) {
                    result = {
                        name: [it.propertyName.text, rightPartOfReferName].join('.'),
                        path: importPath,
                    }
                }
            });
        }
    }

    return result;
}
