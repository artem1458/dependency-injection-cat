import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { initContexts } from '../../core/initContexts';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import DICatWebpackPlugin from '../../plugins/webpack';
import { get } from 'lodash';

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    initContexts();

    const transformerFactory = getTransformerFactory();

    return context => sourceFile => {
        const transformedSourceFile = transformerFactory(context)(sourceFile);

        if (!get(DICatWebpackPlugin, 'isErrorsHandledByWebpack')) {
            const errorMessage = CompilationContext.getErrorMessage();

            if (errorMessage !== null) {
                throw new Error(errorMessage);
            }
        }

        return transformedSourceFile;
    };
};
