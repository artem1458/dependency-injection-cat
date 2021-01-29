import { ICompilationContextError } from './ICompilationContextError';
import { getPositionOfNode } from '../internal/utils/getPositionOfNode';

interface ICompilationContext {
    errors: ICompilationContextError[];
    textErrors: string[];
}

class CompilationError extends Error {
    constructor(
        public message: string,
    ) {
        super();
        this.stack = undefined;
    }
}

export class CompilationContext {
    static compilationContext: ICompilationContext = {
        errors: [],
        textErrors: [],
    };

    static reportError(error: ICompilationContextError): void {
        this.compilationContext.errors.push(error);
    }

    static reportErrorMessage(message: string): void {
        this.compilationContext.textErrors.push(message);
    }

    static reportAndThrowErrorMessage(message: string): never {
        throw new CompilationError(message);
    }

    static throw(): void {
        if (this.compilationContext.errors.length === 0) {
            return;
        }

        const errorMessages: string[] = [
            '\n/-/-/-/-/-/-/-/-/-/-/-/-/ Compilation errors /-/-/-/-/-/-/-/-/-/-/-/-/-/-/\n'
        ];

        this.compilationContext.textErrors.forEach(error => errorMessages.push(error));

        this.compilationContext.errors.forEach(error => {
            errorMessages.push(this.formatCompilationContextError(error));
        });

        throw new CompilationError(errorMessages.join('\n'));
    }

    private static formatCompilationContextError({ message, node }: ICompilationContextError): string {
        const nodePosition = getPositionOfNode(node);
        const path = node.getSourceFile().fileName;

        return `${message}\nAt: (${path}:${nodePosition[0]}:${nodePosition[1]})\n`;
    }
}
