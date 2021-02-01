import upath from 'path';
import ts, { factory } from 'typescript';
import { getBuildedContextDirectory } from '../utils/getBuildedContextDirectory';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';
import { PathResolver } from '../../ts-helpers/path-resolver/PathResolver';

export const relativizeImports = (): ts.TransformerFactory<ts.SourceFile> => {
    return (context) => sourceFile => {
        const visitor: ts.Visitor = (node: ts.Node) => {
            if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = removeQuotesFromString(node.moduleSpecifier.getText());

                const absolutePathFromResolver = PathResolver.resolve(
                    sourceFile.fileName,
                    moduleSpecifier,
                );

                //TODO resolve problem with extensions
                if (upath.isAbsolute(absolutePathFromResolver)) {
                    const buildedContextDirectory = getBuildedContextDirectory();
                    const newRelative = upath.relative(
                        buildedContextDirectory,
                        absolutePathFromResolver,
                    );

                    return factory.updateImportDeclaration(
                        node,
                        node.decorators,
                        node.modifiers,
                        node.importClause,
                        factory.createStringLiteral(newRelative),
                    );
                }
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};
