import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../ErrorCode';

export class DecoratorsCountError extends AbstractCompilationError {
    public code = ErrorCode.DI_2;
    public description = 'Wrong decorators count.';
}
