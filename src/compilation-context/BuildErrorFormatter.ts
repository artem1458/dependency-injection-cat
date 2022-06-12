import { AbstractCompilationError } from '../exceptions/compilation/AbstractCompilationError';
import { AbstractTransformationError } from '../exceptions/transformation/AbstractTransformationError';
import { INodePosition } from '../core/utils/getPositionOfNode';
import chalk from 'chalk';

export class BuildErrorFormatter {
    static formatErrors(compilationErrors: AbstractCompilationError[], transformationErrors: AbstractTransformationError[]): string | null {
        const contextPathToCompilationErrors = this.groupByContexts(compilationErrors);
        const filePathToTransformationErrors = this.groupByFilePath(transformationErrors);

        const formattedCompilationErrors = new Set<string>();
        const formattedTransformationError = new Set<string>();

        contextPathToCompilationErrors.forEach((errors, contextPath) => {
            const formattedErrors = errors.map(it => this.formatError(it)).join('\n');

            if (contextPath === null || errors.length === 0) {
                formattedCompilationErrors.add(formattedErrors);
                return ;
            }

            const contextDetails = errors[0].contextDetails!;

            const contextPrefix = `${chalk.red('\nErrors occurred in')}: ${contextDetails.name} ${this.getPathWithPosition(contextPath, contextDetails.namePosition)}`;

            formattedCompilationErrors.add(contextPrefix + '\n' + formattedErrors);
        });

        filePathToTransformationErrors.forEach((errors) => {
            const formattedErrors = errors.map(it => this.formatError(it)).join('\n');

            formattedCompilationErrors.add(formattedErrors);
        });

        const allErrors = [
            ...Array.from(formattedCompilationErrors.values()),
            ...Array.from(formattedTransformationError.values()),
        ];

        if (allErrors.length === 0) {
            return null;
        }

        return allErrors.join('\n') + '\n';
    }

    private static groupByFilePath<T extends AbstractCompilationError | AbstractTransformationError>(errors: T[]): Map<string, T[]> {
        return errors.reduce((acc, curr) => {
            const list: T[] = acc.get(curr.filePath) ?? [];

            if (!acc.has(curr.filePath)) {
                acc.set(curr.filePath, list);
            }

            list.push(curr);

            return acc;
        }, new Map<string, T[]>());
    }

    private static groupByContexts(errors: AbstractCompilationError[]): Map<string | null, AbstractCompilationError[]> {
        return errors.reduce((acc, curr) => {
            const list: AbstractCompilationError[] = acc.get(curr.contextDetails?.path ?? null) ?? [];

            if (!acc.has(curr.contextDetails?.path ?? null)) {
                acc.set(curr.contextDetails?.path ?? null, list);
            }

            list.push(curr);

            return acc;
        }, new Map<string | null, AbstractCompilationError[]>());
    }

    private static formatError(error: AbstractCompilationError | AbstractTransformationError): string {
        const filePathWithPosition = this.getPathWithPosition(error.filePath, error.position);

        return `${chalk.red('Error')} ${chalk.gray(error.code + ':')} ${error.description} ${error.details ?? ''} ${filePathWithPosition}`;
    }

    private static getPathWithPosition(
        path: string,
        position: INodePosition,
    ): string {
        return `(${path}:${position.line}:${position.startColumn})`;
    }
}
