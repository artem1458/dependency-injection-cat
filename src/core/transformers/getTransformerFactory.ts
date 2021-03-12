import ts, { factory } from 'typescript';
import { uniqBy } from 'lodash'
import { isContainerAccess } from '../ts-helpers/container/isContainerAccess';
import { replaceContainerCall } from '../ts-helpers/container/replaceContainerCall';
import { removeDIImportsFromStatements } from '../ts-helpers/removeDIImports';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';

export const getTransformerFactory = (): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        const factoryImportsToAdd: ts.ImportDeclaration[] = [];
        let hasContainerAccess = false;

        const visitor: ts.Visitor = (node => {
            if (isContainerAccess(node)) {
                hasContainerAccess = true;
                return replaceContainerCall(node, factoryImportsToAdd);
            }

            return ts.visitEachChild(node, visitor, context);
        });

        const newSourceFile = ts.visitNode(sourceFile, visitor);
        const filteredStatements = hasContainerAccess ?
            removeDIImportsFromStatements(newSourceFile.statements)
            : newSourceFile.statements;

        const uniqFactoryImportsToAdd = uniqBy(factoryImportsToAdd, it => removeQuotesFromString(it.moduleSpecifier.getText()));

        return factory.updateSourceFile(
            sourceFile,
            [
                ...uniqFactoryImportsToAdd,
                ...filteredStatements,
            ],
            sourceFile.isDeclarationFile,
            sourceFile.referencedFiles,
            undefined,
            sourceFile.hasNoDefaultLib,
            undefined,
        );
    };
};
