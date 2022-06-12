import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class MissingBeanDeclarationError extends AbstractCompilationError {
    public code = ErrorCode.DI_5;
    public description = 'Missing Bean declaration.';
}
