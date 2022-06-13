import { MessageCode } from '../MessageCode';
import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageType } from '../MessageType';

export class IncorrectContainerAccessError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT12;
    public type = MessageType.ERROR;
    public description = 'Incorrect container access.';
}
