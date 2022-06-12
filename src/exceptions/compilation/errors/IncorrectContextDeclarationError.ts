import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectContextDeclarationError extends AbstractCompilationError {
    public code = ErrorCode.DICAT11;
    public description = 'Incorrect context declaration.';
}
