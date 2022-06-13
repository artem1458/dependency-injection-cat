import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';

export class IncorrectTypeDefinitionError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT4;
    public description = 'Incorrect type definition.';
}
