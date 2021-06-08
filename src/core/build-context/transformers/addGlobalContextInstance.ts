import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { getGlobalContextVariableNameByContextId } from '../utils/getGlobalContextVariableNameByContextId';
import { getBeanConfigObjectLiteral } from './getBeanConfigObjectLiteral';

export const addGlobalContextInstance = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        return ts.factory.updateSourceFile(
            sourceFile,
            [
                ...sourceFile.statements,
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
                    contextDescriptor.node.name,
                    undefined,
                    [
                        factory.createTemplateExpression(
                            factory.createTemplateHead(
                                'Global Context ',
                                'Global Context '
                            ),
                            [factory.createTemplateSpan(
                                factory.createPropertyAccessExpression(
                                    contextDescriptor.node.name,
                                    factory.createIdentifier('name')
                                ),
                                factory.createTemplateTail(
                                    '',
                                    ''
                                )
                            )]
                        ),
                        getBeanConfigObjectLiteral(contextDescriptor),
                    ]
                )
            )],
            ts.NodeFlags.Const
        )
    );
}
