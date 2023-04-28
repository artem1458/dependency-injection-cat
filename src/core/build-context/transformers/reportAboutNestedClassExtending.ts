import ts from 'typescript';
import { isExtendsClass } from '../../ts-helpers/predicates/isExtendsClass';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { IncorrectUsageError } from '../../../compilation-context/messages/errors/IncorrectUsageError';

export const reportAboutNestedClassExtending = (compilationContext: CompilationContext): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
            if (isExtendsClass(node, 'CatContext') && !ts.isSourceFile(node.parent)) {
                compilationContext.report(new IncorrectUsageError(
                    'Class that extends CatContext should be in top level of file.',
                    node,
                    null,
                ));
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};
