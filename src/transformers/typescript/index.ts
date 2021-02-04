import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { runCompile } from '../../internal/runCompile';
import { getTransformerFactory } from '../../external/transformers/getTransformerFactory';
import { logLogo } from '../../external/transformers/logLogo';

logLogo();

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    runCompile();

    return getTransformerFactory();
};
