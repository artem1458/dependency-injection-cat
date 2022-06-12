import { AbstractCompilationError } from '../AbstractCompilationError';
import { ErrorCode } from '../../ErrorCode';

export class TypeQualifyError extends AbstractCompilationError {
    public code = ErrorCode.DI_3;
    public description = 'Can not qualify type.';
}
