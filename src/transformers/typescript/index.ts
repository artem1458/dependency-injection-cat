import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { runCompile } from '../../internal/runCompile';
import { getTransformerFactory } from '../../internal/transformers/getTransformerFactory';
import { logLogo } from '../../internal/transformers/logLogo';

logLogo();

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    runCompile();

    return getTransformerFactory();
};
