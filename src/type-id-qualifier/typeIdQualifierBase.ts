import * as ts from 'typescript';
import { TypeQualifierError } from './TypeQualifierError';
import { getBaseTypeNameAndPathFromImport } from './getBaseTypeNameAndPathFromImport';
import { getBaseTypeAndPathFromStatements } from './getBaseTypeAndPathFromDeclarations';
import { END_PATH_TOKEN, START_PATH_TOKEN } from './parseTokens';

export function typeIdQualifierBase(node: ts.TypeReferenceNode): string {
    if (node.typeName === undefined) {
        throw new Error(TypeQualifierError.NoTypeNameFound);
    }

    const referTypeName = getReferTypeName(node.typeName);
    const leftSideName = referTypeName.split('.')[0];
    const typeName = getBaseTypeNameAndPath(node, leftSideName, referTypeName);

    if (typeName === undefined) {
        throw new Error(TypeQualifierError.CanNotGenerateType);
    }

    return typeName;
}

function getBaseTypeNameAndPath(node: ts.Node, nameToFind: string, referTypeName: string): string | undefined {
    const sourceFile = node.getSourceFile();
    const typeFromImport = getBaseTypeNameAndPathFromImport(sourceFile, nameToFind);
    const typeFromStatement = getBaseTypeAndPathFromStatements(sourceFile, nameToFind);

    if (typeFromImport && typeFromStatement && typeFromImport.name === typeFromStatement.name) {
        throw new Error(`Duplicate identifiers detected, when trying to resolve TypeReference ${nameToFind}, Path ${sourceFile.fileName}`);
    }

    if (typeFromImport) {
        return `${START_PATH_TOKEN}${typeFromImport.path}${END_PATH_TOKEN}${referTypeName}`;
    }

    if (typeFromStatement) {
        return `${START_PATH_TOKEN}${typeFromStatement.path}${END_PATH_TOKEN}${referTypeName}`
    }

    return undefined;
}

function getReferTypeName(node: ts.EntityName, prevText = ''): string {
    if (node.kind === ts.SyntaxKind.Identifier) {
        const text = node.escapedText;
        if (text === undefined) {
            throw new Error('node.escapedText have no text');
        }

        return `${text}.${prevText}`.replace(/\.$/, '');
    }

    if (node.kind === ts.SyntaxKind.QualifiedName) {
        const text = node.right.escapedText;
        if (text === undefined) {
            throw new Error('node.right.escapedText have no text');
        }

        return getReferTypeName(node.left, `${text.toString()}.${prevText}`);
    }

    return prevText.replace(/\.$/, '');
}
