import { createProgram, Program } from 'typescript';
import { diConfigRepository } from '../di-config-repository';
import { getTsConfigPaths } from '../utils/getTsConfigPaths';

export class ProgramRepository {
    private static _program: Program | undefined;

    static initProgram(program: Program): void {
        if (ProgramRepository._program === undefined) {
            const oldCompilerOptions = program.getCompilerOptions();
            // TODO Needs to use nearest to file tsconfig file and somehow group factories by nearest tsConfig (in future)
            const paths = getTsConfigPaths(oldCompilerOptions.configFilePath as string);

            const compilerOptions = {
                ...oldCompilerOptions,
                noResolve: false,
                paths,
            };

            ProgramRepository._program = createProgram(diConfigRepository, compilerOptions);
        }
    }

    static get program(): Program {
        if (ProgramRepository._program === undefined) {
            throw new Error('Trying to access new program before program initialization');
        }

        return ProgramRepository._program;
    }
}
