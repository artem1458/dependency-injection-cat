import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class DecoratorsCountError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT2;
    public type = MessageType.ERROR;
    public description = 'Wrong decorators count.';
}
