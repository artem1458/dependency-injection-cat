import * as ts from 'typescript';
import { ITransformerConfig, initTransformerConfig } from '../transformer-config';
import { initDiConfigRepository } from '../di-config-repository';
import { registerTypes } from '../type-register/registerTypes';
import { registerDependencies } from '../types-dependencies-register/registerDependencies';

const transformer = (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    initTransformerConfig(config);
    initDiConfigRepository();
    registerTypes(program);
    registerDependencies(program);

    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
}

export default transformer;

