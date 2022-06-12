import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectArgumentsLengthError extends AbstractCompilationError {
    public code = ErrorCode.DI_9;
    public description = 'Incorrect arguments length.';
}
