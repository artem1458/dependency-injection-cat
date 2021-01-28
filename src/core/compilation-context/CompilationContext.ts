import { ICompilationContextError } from './ICompilationContextError';

interface ICompilationContext {
    errors: ICompilationContextError[];
}

class CompilationError extends Error {
    constructor(
        public message: string,
    ) {
        super();
    }
}

export class CompilationContext {
    static compilationContext: ICompilationContext = {
        errors: [],
    };

    static reportError(error: ICompilationContextError): void {
        this.compilationContext.errors.push(error);
    }

    static reportAndThrowError(error: ICompilationContextError): never {
        throw new CompilationError(this.formatCompilationContextError(error));
    }

    static throw(): void {
        if (this.compilationContext.errors.length === 0) {
            return;
        }

        const errorMessages = ['\n'];


        this.compilationContext.errors.forEach(error => {
            errorMessages.push(this.formatCompilationContextError(error));
        });

        throw new CompilationError(errorMessages.join('\n'));
    }

    private static formatCompilationContextError({ path, errorMessage, nodePosition }: ICompilationContextError): string {
        return `${errorMessage}\nAt: (${path}:${nodePosition[0]}:${nodePosition[1]})\n`;
    }
}
