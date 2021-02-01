import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { BeanRepository } from '../../bean/BeanRepository';
import { PRIVATE_TOKEN } from '../constants';
import { CONTEXT_POOL_IMPORT } from './addNecessaryImports';

const beanConfigDeclarationName = `beanConfig${PRIVATE_TOKEN}`;
export const CONTEXT_POOL_POSTFIX = `_POOL_${PRIVATE_TOKEN}`;

export const addContextPool = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        return ts.factory.updateSourceFile(
            sourceFile,
            [
                ...sourceFile.statements,
                ...createBeanConfigMapForContextPool(contextDescriptor),
                createContextNamePool(contextDescriptor),
            ]
        );
    };
};

function createBeanConfigMapForContextPool(contextDescriptor: IContextDescriptor): ts.Statement[] {
    const beanConfigDeclaration = factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
                factory.createIdentifier(beanConfigDeclarationName),
                undefined,
                factory.createTypeLiteralNode([factory.createIndexSignature(
                    undefined,
                    undefined,
                    [factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        factory.createIdentifier('index'),
                        undefined,
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        undefined
                    )],
                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )]),
                factory.createObjectLiteralExpression(
                    [],
                    false
                )
            )],
            ts.NodeFlags.Const
        )
    );

    const contextBeans = BeanRepository.contextNameToBeanDescriptorsMap.get(contextDescriptor.name) ?? [];

    const mapFilling: any[] = contextBeans.map(it =>
        factory.createExpressionStatement(factory.createBinaryExpression(
            factory.createElementAccessExpression(
                factory.createIdentifier(beanConfigDeclarationName),
                factory.createStringLiteral(it.classMemberName)
            ),
            factory.createToken(ts.SyntaxKind.EqualsToken),
            factory.createObjectLiteralExpression(
                [factory.createPropertyAssignment(
                    factory.createIdentifier('scope'),
                    factory.createStringLiteral(it.scope)
                )],
                false
            )
        ))
    );

    return [
        beanConfigDeclaration,
        ...mapFilling,
    ];
}

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
