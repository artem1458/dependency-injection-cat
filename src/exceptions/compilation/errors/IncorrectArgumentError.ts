import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectArgumentError extends AbstractCompilationError {
    public code = ErrorCode.DI_7;
    public description = 'Incorrect argument.';
}
