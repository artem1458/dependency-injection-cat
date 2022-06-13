import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { initContexts } from '../../core/initContexts';
import DICatWebpackPlugin from '../../plugins/webpack';
import { get } from 'lodash';
import { getCompilationContext } from '../getCompilationContext';
import { BuildErrorFormatter } from '../../compilation-context/BuildErrorFormatter';

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    const compilationContext = getCompilationContext();
    initContexts(compilationContext);

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
