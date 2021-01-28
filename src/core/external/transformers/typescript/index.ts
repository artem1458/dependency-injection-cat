import * as ts from 'typescript';
import { ITransformerConfig } from '../../../../transformer-config';
import { initTransformerConfig } from '../config';
import { CompilerOptionsProvider } from '../../../../compiler-options-provider/CompilerOptionsProvider';
import { runCompile } from '../../../internal/runCompile';
import { PathResolver } from '../../../internal/ts-helpers/path-resolver/PathResolver';

export default (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    CompilerOptionsProvider.options = program.getCompilerOptions();
    initTransformerConfig(config);
    PathResolver.init();
    runCompile();

    return context => {
        return node => {
            return node;
        };
    };
};
