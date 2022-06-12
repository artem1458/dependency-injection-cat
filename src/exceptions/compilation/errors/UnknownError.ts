import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class UnknownError extends AbstractCompilationError {
    public code = ErrorCode.DI_0;
    public description = 'Unknown error.';
}
