import ts from 'typescript';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { initGlobalContexts } from '../../core/initGlobalContexts';
import DICatWebpackPlugin from '../../plugins/webpack';
import { get } from 'lodash';
import { getCompilationContext } from '../getCompilationContext';
import { BuildErrorFormatter } from '../../compilation-context/BuildErrorFormatter';

export default (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
    const compilationContext = getCompilationContext();
    initGlobalContexts(compilationContext);

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
