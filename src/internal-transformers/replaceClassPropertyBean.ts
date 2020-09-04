import * as ts from 'typescript';
import { isClassPropertyBean } from '../typescript-helpers/decorator-helpers/isClassPropertyBean';
import { getFactoryDependencies } from '../factories/utils/getFactoryDependencies';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { classPropertyBeanTypeIdQualifier } from '../typescript-helpers/type-id-qualifier/class-property-bean/classPropertyBeanTypeIdQualifier';
import { TypeDependencyRepository } from '../types-dependencies-register/TypeDependencyRepository';
import { getPublicInstanceIdentifier } from '../typescript-helpers/getPublicInstanceIdentifier';
import { getFactoryNameForNamespaceImport } from '../factories/utils/getFactoryNameForNamespaceImport';

export const replaceClassPropertyBean = (factoryId: string): ts.TransformerFactory<ts.SourceFile> =>
    context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (isClassPropertyBean(node)) {
                    const nodeTypeArguments = node.initializer.typeArguments ?? [];
                    const nodeType = nodeTypeArguments[0];
                    const { typeId } = classPropertyBeanTypeIdQualifier(node);

                    const dependencies = TypeDependencyRepository.getDependencies(typeId);
                    const dependenciesStatements = getConstantsStatements(factoryId, dependencies);
                    const dependenciesIdentifiers = dependenciesStatements.map((_, index) => ts.createIdentifier(`arg_${index}`));

                    const classIdentifier = node.initializer.arguments[0] as ts.Identifier;
                    const returnStatement = ts.createReturn(ts.createNew(
                        classIdentifier,
                        undefined,
                        dependenciesIdentifiers,
                    ));

                    const body = ts.createBlock(
                        [
                            ...dependenciesStatements,
                            returnStatement,
                        ],
                        true,
                    );

                    return ts.createMethod(
                        undefined,
                        undefined,
                        undefined,
                        node.name,
                        undefined,
                        undefined,
                        [],
                        nodeType,
                        body,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };

function getConstantsStatements(factoryId: string, dependencies: Array<string>): ts.VariableStatement[] {
    const factoryInDependencies = getFactoryDependencies(factoryId);
    const factoryOutDependencies = TypeRegisterRepository.getTypesByFactoryId(factoryId);

    return dependencies.map((dependencyTypeId, index) => {
        const driverType = factoryOutDependencies.find(type => type.id === dependencyTypeId);
        const drivenType = factoryInDependencies.find(type => type.id === dependencyTypeId);
        const parameterName = `arg_${index}`

        if (driverType !== undefined) {
            return ts.createVariableStatement(
                undefined,
                ts.createVariableDeclarationList(
                    [ts.createVariableDeclaration(
                        ts.createIdentifier(parameterName),
                        undefined,
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createPropertyAccess(
                                    ts.createIdentifier(driverType.factoryName),
                                    getPublicInstanceIdentifier(driverType.factoryName),
                                ),
                                ts.createIdentifier(driverType.beanName)
                            ),
                            undefined,
                            []
                        )
                    )],
                    ts.NodeFlags.Const
                )
            );
        } else if (drivenType !== undefined) {
            return ts.createVariableStatement(
                undefined,
                ts.createVariableDeclarationList(
                    [ts.createVariableDeclaration(
                        ts.createIdentifier(parameterName),
                        undefined,
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createPropertyAccess(
                                    ts.createPropertyAccess(
                                        ts.createIdentifier(getFactoryNameForNamespaceImport(drivenType.configId)),
                                        ts.createIdentifier(drivenType.factoryName),
                                    ),
                                    getPublicInstanceIdentifier(drivenType.factoryName)
                                ),
                                ts.createIdentifier(drivenType.beanName)
                            ),
                            undefined,
                            []
                        )
                    )],
                    ts.NodeFlags.Const
                )
            );
        } else {
            throw new Error('Type of dependency not register in config ' + dependencyTypeId); //TODO Add more readable error
        }
    })
}
