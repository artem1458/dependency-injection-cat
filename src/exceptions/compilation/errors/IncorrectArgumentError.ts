import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectArgumentError extends AbstractCompilationError {
    public code = ErrorCode.DICAT7;
    public description = 'Incorrect argument.';
}
