import { AbstractCompilationError } from '../exceptions/compilation/AbstractCompilationError';

export class CompilationContext {
    errors = new Set<AbstractCompilationError>();

    report(error: AbstractCompilationError): void {
        this.errors.add(error);
    }

    clearErrorsByFilePath(path: string): void {
        this.errors.forEach(it => {
            if (it.filePath === path) {
                this.errors.delete(it);
            }
        });
    }
}
