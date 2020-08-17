import { createProgram, Program, TypeChecker } from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { CompilerOptionsProvider } from '../compiler-options-provider/CompilerOptionsProvider';

export class ProgramRepository {
    private static _program: Program | undefined;
    private static _typeChecker: TypeChecker | undefined;

    static initProgram(): void {
        const newProgram = createProgram(DiConfigRepository.data, CompilerOptionsProvider.options);
        //CRUTCH???
        ProgramRepository._typeChecker = newProgram.getTypeChecker();
        ProgramRepository._program = newProgram;
    }

    static get program(): Program {
        if (ProgramRepository._program === undefined) {
            throw new Error('Trying to access new program before program initialization');
        }

        return ProgramRepository._program;
    }

    static get typeChecker(): TypeChecker {
        if (ProgramRepository._typeChecker === undefined) {
            throw new Error('Trying to access typeChecker before program initialization');
        }

        return ProgramRepository._typeChecker;
    }

}
