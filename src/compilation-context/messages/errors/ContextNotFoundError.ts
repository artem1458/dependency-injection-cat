import { MessageCode } from '../MessageCode';
import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageType } from '../MessageType';

export class ContextNotFoundError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT13;
    public type = MessageType.ERROR;
    public description = 'Context not found.';
}
