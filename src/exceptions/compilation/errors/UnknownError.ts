import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class UnknownError extends AbstractCompilationError {
    public code = ErrorCode.DICAT0;
    public description = 'Unknown error.';
}
