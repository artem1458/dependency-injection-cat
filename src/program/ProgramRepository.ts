import { createProgram, Program } from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { CompilerOptionsProvider } from '../compiler-options-provider/CompilerOptionsProvider';

export class ProgramRepository {
    private static _program: Program | undefined;

    static initProgram(): void {
        const newProgram = createProgram(DiConfigRepository.data, CompilerOptionsProvider.options);
        //SETTING PARENT PROPERTY OF ALL NODES
        newProgram.getTypeChecker();
        ProgramRepository._program = newProgram;
    }

    static get program(): Program {
        if (ProgramRepository._program === undefined) {
            throw new Error('Trying to access new program before program initialization');
        }

        return ProgramRepository._program;
    }
}
