import ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationError } from '../../compilation-context/CompilationError';

export default (): ts.TransformerFactory<ts.SourceFile> => {
    return (context => {
        return node => {
            const message = CompilationContext.getErrorMessage();
            if (message !== null) {
                throw new CompilationError(message);
            }

            return node;
        };
    });
};
