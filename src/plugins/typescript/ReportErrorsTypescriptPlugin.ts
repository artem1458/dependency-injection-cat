import ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationError } from '../../compilation-context/CompilationError';

export default (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
    const message = CompilationContext.getErrorMessage();

    return (context => {
        if (message !== null) {
            throw new CompilationError(message);
        }

        return node => node;
    });
};
