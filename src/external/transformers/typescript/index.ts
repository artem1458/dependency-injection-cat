import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../config';
import { runCompile } from '../../../internal/runCompile';
import { getTransformerFactory } from '../getTransformerFactory';
import { logLogo } from '../logLogo';

logLogo();

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    runCompile();

    return getTransformerFactory();
};
