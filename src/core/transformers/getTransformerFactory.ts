import ts, { factory } from 'typescript';
import { uniqBy } from 'lodash';
import { isContainerAccess } from '../ts-helpers/container/isContainerAccess';
import { replaceContainerCall } from '../ts-helpers/container/replaceContainerCall';
import { unquoteString } from '../utils/unquoteString';
import minimatch from 'minimatch';
import { registerAndTransformContext } from '../build-context/registerAndTransformContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { ConfigLoader } from '../../external/config/ConfigLoader';

export const getTransformerFactory = (
    compilationContext: CompilationContext,
): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        let transformedSourceFile: ts.SourceFile = sourceFile;
        const config = ConfigLoader.load();

        if (minimatch(sourceFile.fileName, config.pattern)) {
            transformedSourceFile = registerAndTransformContext(compilationContext, transformedSourceFile);
        }

        const factoryImportsToAdd: ts.ImportDeclaration[] = [];

        const visitor: ts.Visitor = (node => {
            if (isContainerAccess(node)) {
                return replaceContainerCall(compilationContext, node, factoryImportsToAdd);
            }

            return ts.visitEachChild(node, visitor, context);
        });

        const newSourceFile = ts.visitNode(transformedSourceFile, visitor);

        const uniqFactoryImportsToAdd = uniqBy(factoryImportsToAdd, it => {
            if (ts.isStringLiteral(it.moduleSpecifier)) {
                return unquoteString(it.moduleSpecifier.text);
            }
        });

        return factory.updateSourceFile(
            transformedSourceFile,
            [
                ...uniqFactoryImportsToAdd,
                ...newSourceFile.statements,
            ],
            sourceFile.isDeclarationFile,
            sourceFile.referencedFiles,
            undefined,
            sourceFile.hasNoDefaultLib,
            undefined,
        );
    };
};
