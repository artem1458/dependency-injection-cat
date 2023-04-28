import ts, { factory } from 'typescript';
import { BeanRepository, TBeanNode } from '../../bean/BeanRepository';
import { replacePropertyBean } from './replacePropertyBean';
import { transformMethodBean } from './transformMethodBean';
import { transformArrowFunctionBean } from './transformArrowFunctionBean';
import { transformExpressionOrEmbeddedBean } from './transformExpressionOrEmbeddedBean';
import { LifecycleMethodsRepository } from '../../context-lifecycle/LifecycleMethodsRepository';
import { transformLifecycleMethod } from './transformLifecycleMethod';
import { transformLifecycleArrowFunction } from './transformLifecycleArrowFunction';

export const processMembers = (): ts.TransformerFactory<ts.ClassDeclaration> => {
    return () => {
        return contextNode => {
            const newMembers = contextNode.members.map(node => {
                const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode);
                const lifecycleDescriptor = LifecycleMethodsRepository.nodeToContextLifecycleDescriptor.get(node);

                if (beanDescriptor?.beanKind === 'property') {
                    return replacePropertyBean(beanDescriptor);
                }

                if (beanDescriptor?.beanKind === 'method') {
                    return transformMethodBean(beanDescriptor);
                }

                if (beanDescriptor?.beanKind === 'arrowFunction') {
                    return transformArrowFunctionBean(beanDescriptor);
                }

                if (beanDescriptor?.beanKind === 'expression' || beanDescriptor?.beanKind === 'embedded') {
                    return transformExpressionOrEmbeddedBean(beanDescriptor);
                }

                if (lifecycleDescriptor?.nodeKind === 'method') {
                    return transformLifecycleMethod(lifecycleDescriptor);
                }

                if (lifecycleDescriptor?.nodeKind === 'arrow-function') {
                    return transformLifecycleArrowFunction(lifecycleDescriptor);
                }

                return node;
            });

            return factory.updateClassDeclaration(
                contextNode,
                contextNode.modifiers,
                contextNode.name,
                contextNode.typeParameters,
                contextNode.heritageClauses,
                newMembers
            );
        };
    };
};
