import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../ErrorCode';

export class IncorrectNameError extends AbstractCompilationError {
    public code = ErrorCode.DI_6;
    public description = 'Incorrect name.';
}
