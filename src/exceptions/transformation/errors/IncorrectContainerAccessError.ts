import { AbstractTransformationError } from '../AbstractTransformationError';
import { ErrorCode } from '../../ErrorCode';

export class IncorrectContainerAccessError extends AbstractTransformationError {
    public code = ErrorCode.DI_12;
    public description = 'Incorrect container access.';
}
