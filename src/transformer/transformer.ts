import * as ts from 'typescript';
import { initTransformerConfig, ITransformerConfig } from '../transformer-config';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { isContainerGetCall } from '../container/isContainerGetCall';
import { typeIdQualifier } from '../typescript-helpers/type-id-qualifier';
import { getFactoryNameForNamespaceImport } from '../factories/utils/getFactoryNameForNamespaceImport';
import { getConfigPathWithoutExtension } from '../factories/utils/getConfigPathWithoutExtension';
import { getPublicInstanceIdentifier } from '../typescript-helpers/getPublicInstanceIdentifier';
import { initContainer } from '../init-container';
import { CompilerOptionsProvider } from '../compiler-options-provider/CompilerOptionsProvider';
import { PathResolver } from '../typescript-helpers/path-resolver/PathResolver';
import { clearFactoriesDir } from '../factories/clearFactoriesDir';
import { initWatcher } from '../watcher/initWatcher';

const transformer = (program: ts.Program, config?: ITransformerConfig): ts.TransformerFactory<ts.SourceFile> => {
    clearFactoriesDir();
    initTransformerConfig(config);
    CompilerOptionsProvider.options = program.getCompilerOptions();
    PathResolver.init();
    initContainer();
    initWatcher();

    console.log(TypeRegisterRepository.repository)

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

