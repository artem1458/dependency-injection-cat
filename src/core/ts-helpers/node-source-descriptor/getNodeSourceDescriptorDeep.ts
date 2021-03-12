import * as ts from 'typescript';
import upath from 'upath';
import { flatten } from 'lodash';
import { INodeSourceDescriptor } from './INodeSourceDescriptor';
import { isLocalExportDeclaration } from './LocalExportDeclaration';
import { isNamedStatement } from './NamedStatement';
import { isNamedExportStatement } from './NamedExportStatement';
import { isNamedImports, isNamespaceImportDeclaration } from './ImportDeclarationWithClauseAndNamedBindings';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';
import { PathResolverCache } from '../path-resolver/PathResolverCache';
import { SourceFilesCache } from '../source-files-cache/SourceFilesCache';
import { isExportDeclarationWithoutClauseAndWithModuleSpecifier } from './ExportDeclarationWithoutClauseAndModuleSpecifier';
import { isExternalExportDeclaration, isNamedExternalExportsDeclaration } from './ExternalExportDeclaration';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { isPathRelative } from '../../utils/isPathRelative';

//TODO Add support for default imports/exports
export function getNodeSourceDescriptorDeep(sourceFile: ts.SourceFile, nameToFind: string, exportNodesStack: ts.ExportDeclaration[] = []): INodeSourceDescriptor | null {
    const splittedNameToFind = nameToFind.split('.');

    //Trying to Find in imports-----------------------------------------------------------------------------------------
    const namedImports = sourceFile.statements.filter(isNamedImports);
    const namespaceImports = sourceFile.statements.filter(isNamespaceImportDeclaration);

    //Trying to find in NamespaceImports (import * as DDD from '')------------------------------------------------------
    const foundNamespaceImport = namespaceImports.find(it => it.importClause.namedBindings.name.getText() === splittedNameToFind[0]);

    if (foundNamespaceImport !== undefined) {
        const modulePath = removeQuotesFromString(foundNamespaceImport.moduleSpecifier.getText());

        const resolvedPath = PathResolverCache.getAbsolutePathWithExtension(
            sourceFile.fileName,
            modulePath,
        );

        const newNameToFind = splittedNameToFind.slice(1).join('.');

        if (!upath.isAbsolute(resolvedPath) && !isPathRelative(resolvedPath)) {
            return {
                node: null,
                path: resolvedPath,
                name: newNameToFind,
            };
        }

        if (!upath.isAbsolute(resolvedPath)) {
            return getNodeSourceDescriptorDeep(
                SourceFilesCache.getSourceFileByPath(resolvedPath),
                nameToFind,
                exportNodesStack,
            );
        }

        const newSourceFile = SourceFilesCache.getSourceFileByPath(resolvedPath);

        return getNodeSourceDescriptorDeep(newSourceFile, newNameToFind, exportNodesStack);
    }

    //Trying to find in NamedImports import { dd as cc } from ''--------------------------------------------------------
    let originalNameFromNamedImport = '';

    const foundNamedImport = namedImports.find(it => it.importClause.namedBindings.elements.some(it => {
        if (it.name.getText() === splittedNameToFind[0]) {
            originalNameFromNamedImport = it.propertyName
                ? it.propertyName.getText()
                : it.name.getText();

            return true;
        }

        return false;
    }));

    if (foundNamedImport !== undefined) {
        const modulePath = removeQuotesFromString(foundNamedImport.moduleSpecifier.getText());
        const resolvedPath = PathResolverCache.getAbsolutePathWithExtension(
            sourceFile.fileName,
            modulePath,
        );

        const newNameToFind = [
            originalNameFromNamedImport,
            ...splittedNameToFind.slice(1),
        ].join('.');

        if (!upath.isAbsolute(resolvedPath)) {
            return {
                path: resolvedPath,
                name: newNameToFind,
                node: null,
            };
        }

        const newSourceFile = SourceFilesCache.getSourceFileByPath(resolvedPath);

        return getNodeSourceDescriptorDeep(newSourceFile, newNameToFind, exportNodesStack);
    }

    //Trying to find named export statement in current file-------------------------------------------------------------
    const nodeSourceDescriptorFromTopStatements = getNodeSourceDescriptorFromTopStatements(sourceFile, nameToFind);
    if (nodeSourceDescriptorFromTopStatements !== null) {
        return nodeSourceDescriptorFromTopStatements;
    }

    const exportDeclarations  = sourceFile.statements.filter(ts.isExportDeclaration);

    //Trying to find node in local exports------------------------------------------------------------------------------
    const localExportClauses = exportDeclarations
        .filter(isLocalExportDeclaration)
        .map(it => it.exportClause);

    const localExportSpecifier = flatten(localExportClauses
        .filter(ts.isNamedExports)
        .map(it => it.elements))
        .find(it => it.name.getText() === splittedNameToFind[0]);

    if (localExportSpecifier !== undefined) {
        const originalLocalName = localExportSpecifier.propertyName
            ? localExportSpecifier.propertyName.getText()
            : localExportSpecifier.name.getText();

        const statement = sourceFile.statements
            .filter(isNamedStatement)
            .find(it => it.name.getText() === originalLocalName);

        if (statement !== undefined) {
            const joinedLocalName = [
                originalLocalName,
                ...splittedNameToFind.slice(1),
            ].join('.');

            return {
                path: sourceFile.fileName,
                name: joinedLocalName,
                node: statement,
            };
        }
    }

    //Trying to find node in external exports
    const externalExports = exportDeclarations.filter(isExternalExportDeclaration);
    const externalNamespaceExport = externalExports.find(it => {
        if (ts.isNamespaceExport(it.exportClause)) {
            return it.exportClause.name.getText() === splittedNameToFind[0];
        }

        return false;
    });

    if (externalNamespaceExport !== undefined && !exportNodesStack.includes(externalNamespaceExport)) {
        exportNodesStack.push(externalNamespaceExport);
        const modulePath = removeQuotesFromString(externalNamespaceExport.moduleSpecifier.getText());
        const resolvedPath = PathResolverCache.getAbsolutePathWithExtension(
            sourceFile.fileName,
            modulePath,
        );

        if (!upath.isAbsolute(resolvedPath)) {
            CompilationContext.reportError({
                node: externalNamespaceExport,
                message: 'DI container does not support export * as Something from "node-module"'
            });

            return null;
        }

        const newSourceFile = SourceFilesCache.getSourceFileByPath(resolvedPath);

        return getNodeSourceDescriptorDeep(newSourceFile, splittedNameToFind[1], exportNodesStack);
    }

    const externalNamedExports = externalExports.filter(isNamedExternalExportsDeclaration);

    const externalExportClauseElements = flatten(externalNamedExports.map(it => it.exportClause.elements));
    const externalExportSpecifier = externalExportClauseElements.find(it => it.name.getText() === splittedNameToFind[0]);

    if (externalExportSpecifier !== undefined && !exportNodesStack.includes(externalExportSpecifier.parent.parent)) {
        const exportExpression = externalExportSpecifier.parent.parent;
        exportNodesStack.push(exportExpression);

        const externalExportNameToFind = externalExportSpecifier.propertyName
            ? [
                externalExportSpecifier.propertyName.getText(),
                ...splittedNameToFind.slice(1),
            ].join('.')
            : splittedNameToFind.join('.');
        const modulePath = removeQuotesFromString(exportExpression.moduleSpecifier!.getText());
        const resolvedPath = PathResolverCache.getAbsolutePathWithExtension(
            sourceFile.fileName,
            modulePath,
        );

        if (!upath.isAbsolute(resolvedPath)) {
            CompilationContext.reportError({
                node: externalExportSpecifier,
                message: 'DI container does not support export * as Something from "node-module"',
            });

            return null;
        }

        const newSourceFile = SourceFilesCache.getSourceFileByPath(resolvedPath);

        return getNodeSourceDescriptorDeep(newSourceFile, externalExportNameToFind, exportNodesStack);
    }

    //Trying to find in export * from '' declarations
    const exportAllStatements = exportDeclarations.filter(isExportDeclarationWithoutClauseAndWithModuleSpecifier);
    let result: INodeSourceDescriptor | null = null;

    exportAllStatements.some(it => {
        const modulePath = removeQuotesFromString(it.moduleSpecifier.getText());
        const resolvedPath = PathResolverCache.getAbsolutePathWithExtension(
            sourceFile.fileName,
            modulePath,
        );

        if (!upath.isAbsolute(resolvedPath)) {
            CompilationContext.reportError({
                message: 'DI container does not support export * from "node-module"',
                node: it,
            });

            return null;
        }

        if (!exportNodesStack.includes(it)) {
            exportNodesStack.push(it);
            const newSourceFile = SourceFilesCache.getSourceFileByPath(resolvedPath);

            result = getNodeSourceDescriptorDeep(newSourceFile, nameToFind, exportNodesStack);

            return Boolean(result);
        }

        return false;
    });

    return result;
}

function getNodeSourceDescriptorFromTopStatements(sourceFile: ts.SourceFile, nameToFind: string): INodeSourceDescriptor | null {
    const leftHandExpression = nameToFind.split('.')[0];

    const topExportStatements = sourceFile.statements.filter(isNamedExportStatement);
    const statement = topExportStatements.find(it => it.name.getText() === leftHandExpression);

    if (statement === undefined) {
        return null;
    }

    return {
        name: nameToFind,
        path: sourceFile.fileName,
        node: statement,
    };
}
