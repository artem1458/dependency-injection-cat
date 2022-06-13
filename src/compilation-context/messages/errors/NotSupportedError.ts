import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class NotSupportedError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT15;
    public type = MessageType.ERROR;
    public description = 'Not supported.';
}
