import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { initContexts } from '../../core/initContexts';
import { CompilationContext } from '../../compilation-context/CompilationContext';

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    initContexts();

    const transformerFactory = getTransformerFactory();

    return context => sourceFile => {
        const transformedSourceFile = transformerFactory(context)(sourceFile);

        const errorMessage = CompilationContext.getErrorMessage();

        if (errorMessage !== null) {
            throw new Error(errorMessage);
        }

        return transformedSourceFile;
    };
};
