import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class IncorrectContextDeclarationError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT11;
    public type = MessageType.ERROR;
    public description = 'Incorrect context declaration.';
}
