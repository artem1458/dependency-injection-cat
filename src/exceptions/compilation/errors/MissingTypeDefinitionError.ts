import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class MissingTypeDefinitionError extends AbstractCompilationError {
    public code = ErrorCode.DICAT1;
    public description = 'Missing type definition.';
}
