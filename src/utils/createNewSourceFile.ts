import * as ts from 'typescript';
import { ScriptTarget } from 'typescript';
import { getTsConfigPaths } from './getTsConfigPaths';

export function createNewSourceFile(oldProgram: ts.Program, oldSourceFile: ts.SourceFile): ts.SourceFile {
    const oldCompilerOptions = oldProgram.getCompilerOptions();
    const paths = getTsConfigPaths(oldCompilerOptions.configFilePath as string);

    const compilerOptions = {
        ...oldCompilerOptions,
        noResolve: false,
        paths,
    };

    const newProgram = ts.createProgram([oldSourceFile.fileName], compilerOptions, undefined, oldProgram);
    const sourceFile = newProgram.getSourceFile(oldSourceFile.fileName);

    if (sourceFile === undefined) {
        throw new Error('Source file not found');
    }
    const transformationResult = ts.transform(sourceFile, []);

    return transformationResult.transformed[0];
}
