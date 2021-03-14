import { IContextDescriptor } from '../../context/ContextRepository';
import ts, { factory } from 'typescript';
import { BeanRepository } from '../../bean/BeanRepository';
import { PRIVATE_TOKEN } from '../constants';

export const beanConfigDeclarationName = `beanConfig${PRIVATE_TOKEN}`;

export const createBeanConfigDeclaration = (contextDescriptor: IContextDescriptor): ts.Statement[] => {
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

    const contextBeans = BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? [];

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
};
