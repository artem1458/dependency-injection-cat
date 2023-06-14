import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class DecoratorsCountError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT2;
    public type = MessageType.ERROR;
    public description = 'Decorator must not be used more than once on the same declaration and some decorators can not be combined.';
}
