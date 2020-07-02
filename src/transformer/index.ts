import * as ts from 'typescript';
import { ITransformerConfig, initTransformerConfig } from '../transformer-config';
import { initDiConfigRepository } from '../di-config-repository';

const transformer = (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    initTransformerConfig(config);
    initDiConfigRepository();

    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isTypeReferenceNode(node)) {
                    node.typeName;

                    return node;
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
}

export default transformer;

