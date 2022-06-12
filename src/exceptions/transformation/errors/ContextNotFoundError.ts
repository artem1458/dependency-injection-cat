import { AbstractTransformationError } from '../AbstractTransformationError';
import { ErrorCode } from '../../ErrorCode';

export class ContextNotFoundError extends AbstractTransformationError {
    public code = ErrorCode.DI_13;
    public description = 'Context not found.';
}
