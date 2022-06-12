import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectTypeDefinitionError extends AbstractCompilationError {
    public code = ErrorCode.DI_4;
    public description = 'Incorrect type definition.';
}
