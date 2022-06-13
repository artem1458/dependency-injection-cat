import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class UnknownError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT0;
    public type = MessageType.ERROR;
    public description = 'Unknown error.';
}
