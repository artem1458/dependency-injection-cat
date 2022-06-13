import { AbstractCompilationMessage } from '../AbstractCompilationMessage';
import { MessageCode } from '../MessageCode';
import { MessageType } from '../MessageType';

export class CyclicDependenciesError extends AbstractCompilationMessage {
    public code = MessageCode.DICAT16;
    public type = MessageType.ERROR;
    public description = 'Cyclic dependencies detected.';
}
