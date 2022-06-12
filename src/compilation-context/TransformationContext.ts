import { AbstractTransformationError } from '../exceptions/transformation/AbstractTransformationError';

export class TransformationContext {
    errors = new Set<AbstractTransformationError>();

    report(error: AbstractTransformationError): void {
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
