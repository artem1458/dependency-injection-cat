import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectNameError extends AbstractCompilationError {
    public code = ErrorCode.DICAT6;
    public description = 'Incorrect name.';
}
