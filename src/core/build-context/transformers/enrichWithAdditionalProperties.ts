import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { LifecycleMethodsRepository } from '../../context-lifecycle/LifecycleMethodsRepository';
import { getBeanConfigObjectLiteral } from './getBeanConfigObjectLiteral';

export const enrichWithAdditionalProperties = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.ClassDeclaration> => {
    return () => contextNode => {
        const postConstructMethodNames = Array.from(LifecycleMethodsRepository.getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
            contextDescriptor,
            'post-construct',
        )).map(it => it.classMemberName);
        const beforeDestructMethodNames = Array.from(LifecycleMethodsRepository.getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
            contextDescriptor,
            'before-destruct',
        )).map(it => it.classMemberName);

        const contextNameProperty = factory.createPropertyDeclaration(
            undefined,
            factory.createIdentifier('dicat_contextName'),
            undefined,
            factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            factory.createStringLiteral(contextDescriptor.name),
        );
        const lifecycleConfigProperty = factory.createPropertyDeclaration(
            undefined,
            factory.createIdentifier('dicat_lifecycleConfiguration'),
            undefined,
            undefined,
            factory.createObjectLiteralExpression(
                [
                    factory.createPropertyAssignment(
                        factory.createStringLiteral('post-construct'),
                        factory.createArrayLiteralExpression(
                            postConstructMethodNames.map(it => factory.createStringLiteral(it)),
                            false
                        )
                    ),
                    factory.createPropertyAssignment(
                        factory.createStringLiteral('before-destruct'),
                        factory.createArrayLiteralExpression(
                            beforeDestructMethodNames.map(it => factory.createStringLiteral(it)),
                            false
                        )
                    )
                ],
                true
            )
        );
        const beanConfigurationProperty = factory.createPropertyDeclaration(
            undefined,
            factory.createIdentifier('dicat_beanConfigurationRecord'),
            undefined,
            undefined,
            getBeanConfigObjectLiteral(contextDescriptor),
        );

        return factory.updateClassDeclaration(
            contextNode,
            contextNode.modifiers,
            contextNode.name,
            contextNode.typeParameters,
            contextNode.heritageClauses,
            [
                contextNameProperty,
                lifecycleConfigProperty,
                beanConfigurationProperty,
                ...contextNode.members,
            ]
        );
    };
};
