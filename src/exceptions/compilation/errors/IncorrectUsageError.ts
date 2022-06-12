import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectUsageError extends AbstractCompilationError {
    public code = ErrorCode.DI_14;
    public description = 'Incorrect usage.';
}
