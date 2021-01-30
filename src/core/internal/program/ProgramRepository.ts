import ts from 'typescript';
import { TsConfigProvider } from '../../../compiler-options-provider/TsConfigProvider';

export class ProgramRepository {
    private static _program: ts.Program | undefined;

    static initProgram(contextPaths: Array<string>): void {
        const configFile = ts.readConfigFile(TsConfigProvider.tsConfigPath, ts.sys.readFile);
        const compilerOptions = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            './',
        );


        compilerOptions.options.noResolve = true;
        compilerOptions.options.noLib = true;

        const newProgram = ts.createProgram(contextPaths, compilerOptions.options);
        //SETTING PARENT PROPERTY OF ALL NODES
        newProgram.getTypeChecker();
        this._program = newProgram;
    }

    static get program(): ts.Program {
        if (this._program === undefined) {
            throw new Error('Trying to access new program before program initialization');
        }

        return this._program;
    }
}
