import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { runCompile } from '../../core/runCompile';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { initContexts } from '../../core/initContexts';

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    runCompile();
    initContexts();

    return getTransformerFactory();
};
