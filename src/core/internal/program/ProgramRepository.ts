import { createProgram, Program } from 'typescript';
import { CompilerOptionsProvider } from '../../../compiler-options-provider/CompilerOptionsProvider';

export class ProgramRepository {
    private static _program: Program | undefined;

    static initProgram(contextPaths: Array<string>): void {
        const newProgram = createProgram(contextPaths, CompilerOptionsProvider.options);
        //SETTING PARENT PROPERTY OF ALL NODES
        newProgram.getTypeChecker();
        this._program = newProgram;
    }

    static get program(): Program {
        if (this._program === undefined) {
            throw new Error('Trying to access new program before program initialization');
        }

        return this._program;
    }
}
