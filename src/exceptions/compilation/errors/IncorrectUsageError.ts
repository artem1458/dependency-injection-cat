import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectUsageError extends AbstractCompilationError {
    public code = ErrorCode.DICAT14;
    public description = 'Incorrect usage.';
}
