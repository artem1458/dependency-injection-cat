import chalk from 'chalk';
import { ICompilationContextError, ICompilationContextErrorWithMultipleNodes } from './ICompilationContextError';
import { getPositionOfNode } from '../core/utils/getPositionOfNode';
import { CompilationError } from './CompilationError';
import { diConfig } from '../external/config';

interface ICompilationContext {
    errors: ICompilationContextError[];
    errorsWithMultipleNodes: ICompilationContextErrorWithMultipleNodes[];
    textErrors: string[];
}

interface IDebugErrorWithSingleNode {
    message: string;
    file: string;
    position: [number, number];
}

interface IDebugErrorWithMultipleNodes {
    message: string;
    nodes: {
        file: string;
        position: [number, number];
    }[];
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

    static getErrorMessage(): string | null {
        switch (diConfig.errorMessageType) {
        case 'human':
            return this.getErrorMessagesForHuman();

        case 'debug':
            return this.getErrorMessagesForDebug();
        }
    }

    static clearErrorsByFilePath(filePath: string): void {
        this.compilationContext.errors =
            this.compilationContext.errors.filter(it => it.filePath !== filePath);
        this.compilationContext.errorsWithMultipleNodes =
            this.compilationContext.errorsWithMultipleNodes.filter(it => it.filePath !== filePath);
    }

    private static getErrorMessagesForDebug(): string | null {
        if (this.areErrorsEmpty()) {
            return null;
        }

        const errorsWithSingleNode: IDebugErrorWithSingleNode[] = this.compilationContext.errors.map(this.formatDebugErrorWithSingleNode);
        const errorsWithMultipleNodes: IDebugErrorWithMultipleNodes[] = this.compilationContext.errorsWithMultipleNodes.map(this.formatDebugErrorWithMultipleNodes);

        const result = {
            errors: errorsWithSingleNode,
            errorsWithMultipleNodes: errorsWithMultipleNodes,
            textErrors: this.compilationContext.textErrors
        };

        return JSON.stringify(result);
    }

    private static getErrorMessagesForHuman(): string | null {
        if (this.areErrorsEmpty()) {
            return null;
        }

        const errorMessages: string[] = [
            '\n/-/-/-/-/-/-/-/-/-/-/-/-/ DI-CAT /-/-/-/-/-/-/-/-/-/-/-/-/-/-/\n'
        ];

        this.compilationContext.textErrors.forEach(error => errorMessages.push(error));

        this.compilationContext.errors.forEach(error => {
            errorMessages.push(this.formatCompilationContextData(error));
        });

        this.compilationContext.errorsWithMultipleNodes.forEach(error => {
            errorMessages.push(this.formatCompilationContextDataWithMultipleNodes(error));
        });

        return chalk.red(errorMessages.join('\n'));
    }

    private static formatDebugErrorWithSingleNode({
        message,
        node
    }: ICompilationContextError): IDebugErrorWithSingleNode {
        return {
            message,
            file: node.getSourceFile().fileName,
            position: getPositionOfNode(node)
        };
    }

    private static formatDebugErrorWithMultipleNodes({
        message,
        nodes
    }: ICompilationContextErrorWithMultipleNodes): IDebugErrorWithMultipleNodes {
        return {
            message,
            nodes: nodes.map(it => ({
                file: it.getSourceFile().fileName,
                position: getPositionOfNode(it)
            }))
        };
    }

    private static formatCompilationContextData({message, node}: ICompilationContextError): string {
        const nodePosition = getPositionOfNode(node);
        const path = node.getSourceFile().fileName;

        return `${message}\nAt: (${path}:${nodePosition[0]}:${nodePosition[1]})\n`;
    }

    private static formatCompilationContextDataWithMultipleNodes({
        message,
        nodes
    }: ICompilationContextErrorWithMultipleNodes): string {
        const nodePositions = nodes.map(node => getPositionOfNode(node));
        const paths = nodes.map(it => it.getSourceFile().fileName);
        const nodesMessage = paths.map((_, index) =>
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
