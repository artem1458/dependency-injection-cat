import ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { processContexts } from '../build-context/processContexts';
import { reportAboutNestedClassExtending } from '../build-context/transformers/reportAboutNestedClassExtending';

export const getTransformerFactory = (
    compilationContext: CompilationContext,
): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        compilationContext.clearMessagesByFilePath(sourceFile.fileName);

        reportAboutNestedClassExtending(compilationContext)(context)(sourceFile);

        return processContexts(compilationContext, sourceFile);
    };
};
