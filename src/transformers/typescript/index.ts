import ts from 'typescript';
import DICatWebpackPlugin from '../../plugins/webpack';
import { get } from 'lodash';
import { initCompilationContext } from '../getCompilationContext';
import { BuildErrorFormatter } from '../../compilation-context/BuildErrorFormatter';
import { BaseTypesRepository } from '../../core/type-system/BaseTypesRepository';
import { verifyTSVersion } from '../verifyTSVersion';
import { ContextRepository } from '../../core/context/ContextRepository';
import { processContexts } from '../../core/build-context/processContexts';

verifyTSVersion();

export default (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
    const compilationContext = initCompilationContext();
    compilationContext.assignProgram(program);

    return context => sourceFile => {
        compilationContext.clearMessagesByFilePath(sourceFile.fileName);
        ContextRepository.clearByFileName(sourceFile.fileName);
        BaseTypesRepository.init(compilationContext);

        const transformedSourceFile = processContexts(compilationContext, context, sourceFile);

        if (!get(DICatWebpackPlugin, 'isErrorsHandledByWebpack')) {
            const message = BuildErrorFormatter.formatErrors(
                compilationContext.errors,
            );

            if (message !== null) {
                console.log(message);
                process.exit(1);
            }
        }

        return transformedSourceFile;
    };
};
