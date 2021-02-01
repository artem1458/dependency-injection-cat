import { ICompilationContextError, ICompilationContextErrorWithMultipleNodes } from './ICompilationContextError';
import { getPositionOfNode } from '../internal/utils/getPositionOfNode';
import chalk from 'chalk';

interface ICompilationContext {
    errors: ICompilationContextError[];
    errorsWithMultipleNodes: ICompilationContextErrorWithMultipleNodes[];
    textErrors: string[];
}

class CompilationError extends Error {
    constructor(
        message: string,
    ) {
        super();
        this.stack = undefined;
        this.message = chalk.red(message);
    }
}

export class CompilationContext {
    static compilationContext: ICompilationContext = {
        errors: [],
        errorsWithMultipleNodes: [],
        textErrors: [],
    };

    static reportError(error: ICompilationContextError): void {
        this.compilationContext.errors.push(error);
    }

    static reportErrorWithMultipleNodes(error: ICompilationContextErrorWithMultipleNodes): void {
        this.compilationContext.errorsWithMultipleNodes.push(error);
    }

    static reportErrorMessage(message: string): void {
        this.compilationContext.textErrors.push(message);
    }

    static reportAndThrowErrorMessage(message: string): never {
        throw new CompilationError(message);
    }

    static throw(): void {
        if (this.areErrorsEmpty()) {
            return;
        }

        const errorMessages: string[] = [
            '\n/-/-/-/-/-/-/-/-/-/-/-/-/ DI-CAT /-/-/-/-/-/-/-/-/-/-/-/-/-/-/\n'
        ];

        this.compilationContext.textErrors.forEach(error => errorMessages.push(error));

        this.compilationContext.errors.forEach(error => {
            errorMessages.push(this.formatCompilationContextError(error));
        });

        this.compilationContext.errorsWithMultipleNodes.forEach(error => {
            errorMessages.push(this.formatCompilationContextErrorWithMultipleNodes(error));
        });

        this.compilationContext = {
            errorsWithMultipleNodes: [],
            textErrors: [],
            errors: []
        };

        throw new CompilationError(errorMessages.join('\n'));
    }

    private static formatCompilationContextError({ message, node }: ICompilationContextError): string {
        const nodePosition = getPositionOfNode(node);
        const path = node.getSourceFile().fileName;

        return `${message}\nAt: (${path}:${nodePosition[0]}:${nodePosition[1]})\n`;
    }

    private static formatCompilationContextErrorWithMultipleNodes({ message, nodes }: ICompilationContextErrorWithMultipleNodes): string {
        const nodePositions = nodes.map(node => getPositionOfNode(node));
        const paths = nodes.map(it => it.getSourceFile().fileName);
        const nodesMessage = paths.map((_,index) =>
            `At: (${paths[index]}:${nodePositions[index][0]}:${nodePositions[index][1]})`
        ).join('\n');

        return `${message}\n${nodesMessage}\n`;
    }

    private static areErrorsEmpty(): boolean {
        return this.compilationContext.errors.length === 0
            && this.compilationContext.textErrors.length === 0
            && this.compilationContext.errorsWithMultipleNodes.length === 0;
    }
}
