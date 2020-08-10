import * as ts from 'typescript';
import { initTransformerConfig, ITransformerConfig } from '../transformer-config';
import { initDiConfigRepository } from '../di-config-repository';
import { registerTypes } from '../type-register/registerTypes';
import { registerDependencies } from '../types-dependencies-register/registerDependencies';
import { ProgramRepository } from '../program/ProgramRepository';
import { createFactories } from '../factories/createFactories';
import { ShouldReinitializeRepository } from './ShouldReinitializeRepository';
import { PathResolver } from '../paths-resolver/PathResolver';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { isContainerGetCall } from '../container/isContainerGetCall';
import { typeIdQualifier } from '../type-id-qualifier';
import { getFactoryNameForNamespaceImport } from '../factories/utils/getFactoryNameForNamespaceImport';
import { getConfigPathWithoutExtension } from '../factories/utils/getConfigPathWithoutExtension';
import { getPublicInstanceIdentifier } from '../utils/getPublicInstanceIdentifier';

const transformer = (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    initTransformerConfig(config);
    initDiConfigRepository();
    ProgramRepository.initProgram(program);
    PathResolver.init();
    registerTypes();
    // console.log(TypeRegisterRepository.repository)
    registerDependencies();
    createFactories();
    ShouldReinitializeRepository.value = false;

    const typeChecker = program.getTypeChecker();

    return context => {
        return sourceFile => {
            let imports: ts.ImportDeclaration[] = [];

            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isCallExpression(node) && isContainerGetCall(typeChecker, node)) {
                    if (node.typeArguments === undefined) {
                        throw new Error(`It seems you forgot to pass generic type to container.get call, ${node.getText()}, ${sourceFile.fileName}`);
                    }

                    const type = typeIdQualifier(node.typeArguments[0]);

                    const typeInfo = TypeRegisterRepository.getTypeById(type.typeId);

                    imports.push(
                        ts.createImportDeclaration(
                            undefined,
                            undefined,
                            ts.createImportClause(
                                undefined,
                                ts.createNamespaceImport(
                                    ts.createIdentifier(
                                        getFactoryNameForNamespaceImport(typeInfo.configId),
                                    ),
                                ),
                                false
                            ),
                            ts.createStringLiteral(getConfigPathWithoutExtension(typeInfo.configId)),
                        ),
                    );

                    return ts.createCall(
                        ts.createPropertyAccess(
                            ts.createPropertyAccess(
                                ts.createPropertyAccess(
                                    ts.createIdentifier(getFactoryNameForNamespaceImport(typeInfo.configId)),
                                    ts.createIdentifier(typeInfo.factoryName),
                                ),
                                getPublicInstanceIdentifier(typeInfo.factoryName)
                            ),
                            ts.createIdentifier(typeInfo.beanName)
                        ),
                        undefined,
                        []
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            let newSourceFile = ts.visitNode(sourceFile, visitor);
            return ts.updateSourceFileNode(sourceFile, [
                ...imports,
                ...newSourceFile.statements,
            ]);
        };
    };
}

export default transformer;

