import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { initContexts } from '../../core/initContexts';
import DICatWebpackPlugin from '../../plugins/webpack';
import { get } from 'lodash';
import { getTransformersContext } from '../getTransformersContext';
import { BuildErrorFormatter } from '../../build-context/BuildErrorFormatter';

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    const [
        compilationContext,
        transformationContext
    ] = getTransformersContext();
    initContexts(compilationContext);

    const transformerFactory = getTransformerFactory(compilationContext, transformationContext);

    return context => sourceFile => {
        const transformedSourceFile = transformerFactory(context)(sourceFile);

        if (!get(DICatWebpackPlugin, 'isErrorsHandledByWebpack')) {
            const [compilationContext, transformationContext] = getTransformersContext();
            const message = BuildErrorFormatter.formatErrors(
                Array.from(compilationContext.errors.values()),
                Array.from(transformationContext.errors.values()),
            );

            if (message !== null) {
                console.log(message);
                process.exit(1);
            }
        }

        return transformedSourceFile;
    };
};
