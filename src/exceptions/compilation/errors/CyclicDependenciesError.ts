import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class CyclicDependenciesError extends AbstractCompilationError {
    public code = ErrorCode.DICAT16;
    public description = 'Cyclic dependencies detected.';
}
