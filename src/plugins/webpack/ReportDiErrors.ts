import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationError } from '../../compilation-context/CompilationError';

export default class {
    apply(compiler: any) {
        compiler.hooks.afterCompile.tap('Report DI Errors', (compilation: any) => {
            const message = CompilationContext.getErrorMessage();

            if (message === null) {
                return;
            }

            compilation.errors.push(new CompilationError(message));
        });
    }
}
