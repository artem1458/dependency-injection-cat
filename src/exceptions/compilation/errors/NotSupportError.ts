import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class NotSupportError extends AbstractCompilationError {
    public code = ErrorCode.DICAT15;
    public description = 'Not supported.';
}
