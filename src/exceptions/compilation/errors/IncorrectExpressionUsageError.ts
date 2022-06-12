import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectExpressionUsageError extends AbstractCompilationError {
    public code = ErrorCode.DI_8;
    public description = 'Incorrect expression usage.';
}
