import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class MissingTypeDefinitionError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT1;
    public type = MessageType.ERROR;
    public description = 'Missing type definition.';
}
