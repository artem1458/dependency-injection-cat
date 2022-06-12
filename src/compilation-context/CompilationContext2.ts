import { AbstractCompilationError } from '../exceptions/compilation/AbstractCompilationError';

export class CompilationContext2 {
    errors = new Set<AbstractCompilationError>();

    report(error: AbstractCompilationError): void {
        this.errors.add(error);
    }
}
