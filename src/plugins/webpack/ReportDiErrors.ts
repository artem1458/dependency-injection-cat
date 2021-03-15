import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationError } from '../../compilation-context/CompilationError';

export default class {
    apply(compiler: any) {
        compiler.hooks.thisCompilation.tap('Report DI Errors', (compilation: any) => {
            const message = CompilationContext.getErrorMessage();

            if (message === null) {
                return;
            }

            throw new CompilationError(message);
        });
    }
}
