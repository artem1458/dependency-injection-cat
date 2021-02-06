import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationError } from '../../compilation-context/CompilationError';

export default class TestFile {
    apply(compiler: any) {
        compiler.hooks.afterCompile.tap('MyPlugin', (compilation: any) => {
            const message = CompilationContext.getErrorMessage();

            if (message === null) {
                return;
            }

            compilation.errors.push(new CompilationError(message));


        });
    }
}
