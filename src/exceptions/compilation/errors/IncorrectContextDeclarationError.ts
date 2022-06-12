import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectContextDeclarationError extends AbstractCompilationError {
    public code = ErrorCode.DI_11;
    public description = 'Incorrect context declaration.';
}
