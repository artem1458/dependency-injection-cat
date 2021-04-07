import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { runCompile } from '../../core/runCompile';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { libraryName } from '../../constants/libraryName';
import { ProgramRepository } from '../../core/program/ProgramRepository';

export default function(api: any, options?: IDiConfig) {
    initDiConfig(options);
    runCompile();
    const transformerFactory = getTransformerFactory();
    const printer = ts.createPrinter();

    return {
        visitor: {
            Program(path: any, meta: any) {
                const imports: any[] = path.node.body.filter((it: any) => it.type === 'ImportDeclaration');
                const hasLibraryImport = imports.some(it => {
                    const moduleSpecifier = it?.source?.value;
                    if (!moduleSpecifier) {
                        return false;
                    }
                    return moduleSpecifier === libraryName;
                });

                if (!hasLibraryImport) {
                    return;
                }

                const fileText = meta.file.code;
                const filePath = meta.filename;
                const tsSourceFile = ts.createSourceFile(
                    filePath,
                    fileText,
                    ProgramRepository.program.getCompilerOptions().target ?? ts.ScriptTarget.ES2015,
                    true,
                );
                const result = ts.transform<ts.SourceFile>(
                    tsSourceFile,
                    [transformerFactory],
                );
                const resultText = printer.printFile(result.transformed[0]);

                path.node.body = api.parse(resultText, {
                    plugins: meta.file.opts.plugins
                }).program.body;
            }
        }
    };
}
