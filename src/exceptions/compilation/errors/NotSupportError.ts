import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class NotSupportError extends AbstractCompilationError {
    public code = ErrorCode.DI_15;
    public description = 'Not supported.';
}
