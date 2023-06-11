import ts from 'typescript';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { CONSTANTS } from '../../constants';
import { uniqId } from '../../core/utils/uniqId';
import { getCompilationContext } from '../getCompilationContext';
import { PathResolver } from '../../core/ts-helpers/path-resolver/PathResolver';

const IGNORE_TRANSFORM_PROPERTY_KEY = uniqId();

export default function (api: any) {
    PathResolver.initOnce();
    const compilationContext = getCompilationContext();
    const transformerFactory = getTransformerFactory(compilationContext);
    const printer = ts.createPrinter();

    return {
        visitor: {
            Program(path: any, meta: any) {
                if (path.node[IGNORE_TRANSFORM_PROPERTY_KEY]) {
                    return;
                }

                const imports: any[] = path.node.body.filter((it: any) => it.type === 'ImportDeclaration');
                const hasLibraryImport = imports.some(it => {
                    const moduleSpecifier = it?.source?.value;
                    if (!moduleSpecifier) {
                        return false;
                    }
                    return moduleSpecifier === CONSTANTS.libraryName;
                });

                if (!hasLibraryImport) {
                    return;
                }

                const fileText = meta.file.code;
                const filePath = meta.filename;
                const tsSourceFile = ts.createSourceFile(
                    filePath,
                    fileText,
                    ts.ScriptTarget.Latest,
                    true,
                );
                const result = ts.transform<ts.SourceFile>(
                    tsSourceFile,
                    [transformerFactory],
                );
                const resultText = printer.printFile(result.transformed[0]);
                const parsed = api.parse(resultText, meta.file.opts).program;
                parsed[IGNORE_TRANSFORM_PROPERTY_KEY] = true;

                path.replaceWith(parsed);
            }
        }
    };
}
