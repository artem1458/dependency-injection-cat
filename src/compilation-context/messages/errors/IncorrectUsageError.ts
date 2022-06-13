import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class IncorrectUsageError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT14;
    public type = MessageType.ERROR;
    public description = 'Incorrect usage.';
}
