import ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { processContexts } from './processContexts';

export const getTransformerFactory = (
    compilationContext: CompilationContext,
): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        compilationContext.clearMessagesByFilePath(sourceFile.fileName);

        return processContexts(compilationContext, context, sourceFile);
    };
};
