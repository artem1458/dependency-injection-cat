import ts, { factory } from 'typescript';
import { isContainerAccess } from '../ts-helpers/container/isContainerAccess';
import { replaceContainerCall } from '../ts-helpers/container/replaceContainerCall';
import { removeDIImportsFromStatements } from '../ts-helpers/removeDIImports';

export const getTransformerFactory = (): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        const importsToAdd: ts.ImportDeclaration[] = [];
        let hasContainerAccess = false;

        const visitor: ts.Visitor = (node => {
            if (isContainerAccess(node)) {
                hasContainerAccess = true;
                return replaceContainerCall(node, importsToAdd);
            }

            return ts.visitEachChild(node, visitor, context);
        });

        const newSourceFile = ts.visitNode(sourceFile, visitor);
        const filteredStatements = hasContainerAccess ?
            removeDIImportsFromStatements(newSourceFile.statements)
            : newSourceFile.statements;

        return factory.updateSourceFile(
            sourceFile,
            [
                ...importsToAdd,
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
