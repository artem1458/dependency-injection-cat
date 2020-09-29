import * as ts from 'typescript';
import { initTransformerConfig, ITransformerConfig } from '../transformer-config';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { isContainerGetCall } from '../typescript-helpers/container-call/isContainerGetCall';
import { getFactoryNameForNamespaceImport } from '../factories/utils/getFactoryNameForNamespaceImport';
import { getConfigPathWithoutExtension } from '../factories/utils/getConfigPathWithoutExtension';
import { getPublicInstanceIdentifier } from '../typescript-helpers/getPublicInstanceIdentifier';
import { initContainer } from '../init-container';
import { CompilerOptionsProvider } from '../compiler-options-provider/CompilerOptionsProvider';
import { PathResolver } from '../typescript-helpers/path-resolver/PathResolver';
import { clearFactoriesDir } from '../factories/clearFactoriesDir';
import { initWatcher } from '../watcher/initWatcher';
import { getCallTypeIdQualifier } from '../typescript-helpers/type-id-qualifier/get-call/getCallTypeIdQualifier';
import { isCallExpressionWithTypeArguments } from '../typescript-helpers/call-expression/isCallExpressionWithTypeArguments';

const transformer = (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    clearFactoriesDir();
    initTransformerConfig(config);
    CompilerOptionsProvider.options = program.getCompilerOptions();
    PathResolver.init();
    initContainer();
    initWatcher();

    const typeChecker = program.getTypeChecker();

    return context => {
        return sourceFile => {
            const imports: ts.ImportDeclaration[] = [];

            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isCallExpression(node) && isContainerGetCall(typeChecker, node)) {
                    if (!isCallExpressionWithTypeArguments(node)) {
                        throw new Error(`It seems you forgot to pass generic type to container.get call, ${node.getText()}, ${sourceFile.fileName}`);
                    }

                    const type = getCallTypeIdQualifier(node);

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

            const newSourceFile = ts.visitNode(sourceFile, visitor);
            return ts.updateSourceFileNode(sourceFile, [
                ...imports,
                ...newSourceFile.statements,
            ]);
        };
    };
};

export default transformer;

