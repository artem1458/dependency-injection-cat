import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class DependencyResolvingError extends AbstractCompilationError {
    public code = ErrorCode.DI_10;
    public description = 'Can not resolve dependency.';
}
