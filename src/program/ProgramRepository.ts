import { createProgram, Program, TypeChecker } from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { ShouldReinitializeRepository } from '../transformer/ShouldReinitializeRepository';

export class ProgramRepository {
    private static _program: Program | undefined;
    private static _typeChecker: TypeChecker | undefined;

    static initProgram(program: Program): void {
        if (ShouldReinitializeRepository.value) {
            const oldCompilerOptions = program.getCompilerOptions();
            // TODO Needs to use nearest to file tsconfig file and somehow group factories by nearest tsConfig (in future)

            const compilerOptions = {
                ...oldCompilerOptions,
            };

            const newProgram = createProgram(DiConfigRepository.data, compilerOptions);
            //CRUTCH???
            ProgramRepository._typeChecker = newProgram.getTypeChecker();
            ProgramRepository._program = newProgram;
        }
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
