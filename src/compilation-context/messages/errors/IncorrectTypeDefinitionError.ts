import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class IncorrectTypeDefinitionError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT4;
    public type = MessageType.ERROR;
    public description = 'Incorrect type definition.';
}
