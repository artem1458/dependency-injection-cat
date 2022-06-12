import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectArgumentsLengthError extends AbstractCompilationError {
    public code = ErrorCode.DICAT9;
    public description = 'Incorrect arguments length.';
}
