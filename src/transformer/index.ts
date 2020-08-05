import * as ts from 'typescript';
import { initTransformerConfig, ITransformerConfig } from '../transformer-config';
import { initDiConfigRepository } from '../di-config-repository';
import { registerTypes } from '../type-register/registerTypes';
import { registerDependencies } from '../types-dependencies-register/registerDependencies';
import { ProgramRepository } from '../program/ProgramRepository';
import { createFactories } from '../factories/createFactories';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { TypeDependencyRepository } from '../types-dependencies-register/TypeDependencyRepository';

const transformer = (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    initTransformerConfig(config);
    initDiConfigRepository();
    ProgramRepository.initProgram(program);
    registerTypes();
    registerDependencies();
    createFactories()
    console.log(TypeRegisterRepository.repository);
    console.log(TypeDependencyRepository.graph.g);

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

