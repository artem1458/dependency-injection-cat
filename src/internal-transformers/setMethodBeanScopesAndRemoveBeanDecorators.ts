import * as ts from 'typescript';
import { isMethodBean } from '../core/internal/ts-helpers/predicates/isMethodBean';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { methodBeanTypeIdQualifier } from '../typescript-helpers/type-id-qualifier';
import { ICreateFactoriesContext } from '../factories/ICreateFactoriesContext';
import { getPrivateIdentifier } from '../typescript-helpers/getPrivateIdentifier';
import { isBeanDecorator } from '../core/internal/ts-helpers/predicates/isBeanDecorator';

export const setMethodBeanScopesAndRemoveBeanDecorators = (
    factoryContext: ICreateFactoriesContext,
): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        const visitor: ts.Visitor = (node: ts.Node) => {
            if (isMethodBean(node)) {
                const {typeId} = methodBeanTypeIdQualifier(node);
                const typeInfo = TypeRegisterRepository.getTypeById(typeId);

                const scope = typeInfo.beanInfo.scope;
                const decorators = node.decorators?.filter(it => !isBeanDecorator(it)) || [];

                if (scope === 'singleton' || scope === undefined) {
                    factoryContext.hasSingleton = true;

                    decorators.push(ts.createDecorator(getPrivateIdentifier('Singleton')));
                }

                return ts.updateMethod(
                    node,
                    decorators,
                    node.modifiers,
                    node.asteriskToken,
                    node.name,
                    node.questionToken,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    node.body,
                );
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};

