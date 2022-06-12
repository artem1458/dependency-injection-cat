import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class MissingTypeDefinitionError extends AbstractCompilationError {
    public code = ErrorCode.DI_1;
    public description = 'Missing type definition.';
}
