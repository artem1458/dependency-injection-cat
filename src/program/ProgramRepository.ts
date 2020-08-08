import { createProgram, Program } from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { ShouldReinitializeRepository } from '../transformer/ShouldReinitializeRepository';

export class ProgramRepository {
    private static _program: Program | undefined;

    static initProgram(program: Program): void {
        if (ShouldReinitializeRepository.value) {
            const oldCompilerOptions = program.getCompilerOptions();
            // TODO Needs to use nearest to file tsconfig file and somehow group factories by nearest tsConfig (in future)

            const compilerOptions = {
                ...oldCompilerOptions,
            };

            const newProgram = createProgram(DiConfigRepository.data, compilerOptions);
            //CRUTCH???
            newProgram.getTypeChecker();
            ProgramRepository._program = newProgram;
        }
    }

    static get program(): Program {
        if (ProgramRepository._program === undefined) {
            throw new Error('Trying to access new program before program initialization');
        }

        return ProgramRepository._program;
    }
}
