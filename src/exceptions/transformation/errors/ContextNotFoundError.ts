import { AbstractTransformationError } from '../AbstractTransformationError';
import { ErrorCode } from '../../ErrorCode';

export class ContextNotFoundError extends AbstractTransformationError {
    public code = ErrorCode.DICAT13;
    public description = 'Context not found.';
}
