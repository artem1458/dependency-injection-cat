import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class MissingInitializerError extends AbstractCompilationError {
    public code = ErrorCode.DICAT6;
    public description = 'Missing initializer.';
}
