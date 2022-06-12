import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class MissingInitializerError extends AbstractCompilationError {
    public code = ErrorCode.DI_6;
    public description = 'Missing initializer.';
}
