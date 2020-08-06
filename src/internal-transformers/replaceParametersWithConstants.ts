import * as ts from 'typescript';
import { isBean } from '../utils/isBean';
import { getFactoryDependencies } from '../factories/utils/getFactoryDependencies';
import { typeIdQualifier } from '../type-id-qualifier';
import { getMethodLocationMessage } from '../utils/getMethodLocationMessage';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { getFactoryNameForNamespaceImport } from '../factories/utils/getFactoryNameForNamespaceImport';
import { getPublicInstanceIdentifier } from '../utils/getPublicInstanceIdentifier';

interface IParametersLight {
    parameterName: string;
    typeId: string;
}

export const replaceParametersWithConstants = (typeChecker: ts.TypeChecker, factoryId: string): ts.TransformerFactory<ts.SourceFile> =>
    context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (isBean(node)) {
                    const parameters: IParametersLight[] = node.parameters.map(it => {
                        if (it.type === undefined) {
                            throw new Error('All parameters in Bean should have type' + getMethodLocationMessage(node));
                        }

                        return {
                            parameterName: it.name.getText(),
                            typeId: typeIdQualifier(typeChecker, it),
                        };
                    });

                    const constantStatements = getConstantStatements(
                        factoryId,
                        parameters,
                    );

                    const beanBlock = node.body;

                    if (beanBlock === undefined) {
                        const sourceFileName = node.getSourceFile().fileName;
                        const nodeText = node.getFullText();

                        throw new Error(`Bean body is empty, Path ${sourceFileName}, Node ${nodeText}`);
                    }

                    const newBlock = ts.updateBlock(
                        beanBlock,
                        [
                            ...constantStatements,
                            ...beanBlock.statements,
                        ],
                    );

                    return ts.updateMethod(
                        node,
                        undefined,
                        [],
                        undefined,
                        node.name,
                        undefined,
                        node.typeParameters,
                        [],
                        node.type,
                        newBlock,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };

function getConstantStatements(
    factoryId: string,
    parameters: IParametersLight[],
): ts.Statement[] {
    const factoryInDependencies = getFactoryDependencies(factoryId);
    const factoryOutDependencies = TypeRegisterRepository.getTypesByFactoryId(factoryId);

    return parameters.map(it => {
        const driverType = factoryOutDependencies.find(type => type.id === it.typeId);
        const drivenType = factoryInDependencies.find(type => type.id === it.typeId);
        if (driverType !== undefined) {
            return ts.createVariableStatement(
                undefined,
                ts.createVariableDeclarationList(
                    [ts.createVariableDeclaration(
                        ts.createIdentifier(it.parameterName),
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
                        ts.createIdentifier(it.parameterName),
                        undefined,
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createPropertyAccess(
                                    ts.createPropertyAccess(
                                        ts.createIdentifier(getFactoryNameForNamespaceImport(drivenType.factoryId)),
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
            throw new Error('Type of dependency not register in config'); //TODO Add more readable error
        }
    });
}
