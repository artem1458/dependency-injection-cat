import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { beanConfigDeclarationName, createBeanConfigDeclaration } from './createBeanConfigDeclaration';
import { getGlobalContextVariableNameByContextId } from '../utils/getGlobalContextVariableNameByContextId';

export const addGlobalContextInstance = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        return ts.factory.updateSourceFile(
            sourceFile,
            [
                ...sourceFile.statements,
                ...createBeanConfigDeclaration(contextDescriptor),
                buildGlobalContextInstance(contextDescriptor),
            ]
        );
    };
};

function buildGlobalContextInstance(contextDescriptor: IContextDescriptor): ts.Statement {
    return factory.createVariableStatement(
        [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
                factory.createIdentifier(getGlobalContextVariableNameByContextId(contextDescriptor.id)),
                undefined,
                undefined,
                factory.createNewExpression(
                    factory.createIdentifier(contextDescriptor.className),
                    undefined,
                    [
                        factory.createStringLiteral(`Global Context: ${contextDescriptor.className}`),
                        factory.createIdentifier(beanConfigDeclarationName)
                    ]
                )
            )],
            ts.NodeFlags.Const
        )
    );
}
