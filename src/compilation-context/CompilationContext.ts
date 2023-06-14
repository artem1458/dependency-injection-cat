import ts from 'typescript';
import { AbstractCompilationMessage } from './messages/AbstractCompilationMessage';
import { MessageType } from './messages/MessageType';

export class CompilationContext {
    constructor(
        public readonly program: ts.Program
    ) {}

    get typeChecker(): ts.TypeChecker {
        return this.program.getTypeChecker();
    }

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
