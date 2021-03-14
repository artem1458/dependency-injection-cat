import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { PRIVATE_TOKEN } from '../constants';
import { CONTEXT_POOL_IMPORT } from './addNecessaryImports';
import { beanConfigDeclarationName, createBeanConfigDeclaration } from './createBeanConfigDeclaration';

export const CONTEXT_POOL_POSTFIX = `_POOL_${PRIVATE_TOKEN}`;

export const addContextPool = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        return ts.factory.updateSourceFile(
            sourceFile,
            [
                ...sourceFile.statements,
                ...createBeanConfigDeclaration(contextDescriptor),
                createContextNamePool(contextDescriptor),
            ]
        );
    };
};

function createContextNamePool(contextDescriptor: IContextDescriptor): ts.Statement {
    return factory.createVariableStatement(
        [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
                factory.createIdentifier(`${contextDescriptor.name}${CONTEXT_POOL_POSTFIX}`),
                undefined,
                undefined,
                factory.createNewExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier(CONTEXT_POOL_IMPORT),
                        factory.createIdentifier('ContextPool')
                    ),
                    undefined,
                    [
                        factory.createStringLiteral(contextDescriptor.name),
                        factory.createIdentifier(beanConfigDeclarationName),
                        factory.createIdentifier(contextDescriptor.name),
                    ]
                )
            )],
            ts.NodeFlags.Const
        )
    );

}
