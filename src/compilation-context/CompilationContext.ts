import { AbstractCompilationMessage } from './messages/AbstractCompilationMessage';
import { MessageType } from './messages/MessageType';

export class CompilationContext {
    messages = new Set<AbstractCompilationMessage>();

    get errors(): AbstractCompilationMessage[] {
        return Array.from(this.messages.values()).filter(it => it.type === MessageType.ERROR);
    }

    report(message: AbstractCompilationMessage): void {
        this.messages.add(message);
    }

    clearMessagesByFilePath(path: string): void {
        this.messages.forEach(it => {
            if (it.filePath === path) {
                this.messages.delete(it);
            }
        });
    }
}
