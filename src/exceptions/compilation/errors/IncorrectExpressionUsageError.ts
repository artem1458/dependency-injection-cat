import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectExpressionUsageError extends AbstractCompilationError {
    public code = ErrorCode.DICAT8;
    public description = 'Incorrect expression usage.';
}
