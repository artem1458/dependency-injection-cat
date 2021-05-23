import ts, { factory } from 'typescript';
import upath from 'upath';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';
import { PathResolverCache } from '../../ts-helpers/path-resolver/PathResolverCache';

export const relativizeImports = (): ts.TransformerFactory<ts.SourceFile> => {
    return (context) => sourceFile => {
        const visitor: ts.Visitor = (node: ts.Node) => {
            if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = removeQuotesFromString(node.moduleSpecifier.getText());

                const absolutePathFromResolverWithExtension = PathResolverCache.getAbsolutePathWithExtension(
                    sourceFile.fileName,
                    moduleSpecifier,
                );

                if (upath.isAbsolute(absolutePathFromResolverWithExtension)) {
                    const sourceFileDirname = upath.dirname(sourceFile.fileName);
                    const absoluteImportPathWithoutExtension = removeExtensionFromPath(
                        absolutePathFromResolverWithExtension,
                    );
                    const newRelative = upath.relative(
                        sourceFileDirname,
                        absoluteImportPathWithoutExtension,
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

function removeExtensionFromPath(path: string): string {
    const ext = upath.extname(path);
    return path.slice(0, -ext.length);
}
