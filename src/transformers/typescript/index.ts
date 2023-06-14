import ts from 'typescript';
import { getTransformerFactory } from '../../core/build-context/getTransformerFactory';
import DICatWebpackPlugin from '../../plugins/webpack';
import { get } from 'lodash';
import { initCompilationContext } from '../getCompilationContext';
import { BuildErrorFormatter } from '../../compilation-context/BuildErrorFormatter';
import { BaseTypesRepository } from '../../core/type-system/BaseTypesRepository';

export default (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
    const compilationContext = initCompilationContext(program);
    BaseTypesRepository.init(compilationContext);

    const transformerFactory = getTransformerFactory(compilationContext);

    return context => sourceFile => {
        const transformedSourceFile = transformerFactory(context)(sourceFile);

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
