import { ContextBean } from '../../bean/ContextBean';
import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { getDependencyValueExpression } from './getDependencyValueExpression';

export const getDependenciesVariables = (bean: ContextBean): ts.VariableStatement[] => {
    const dependenciesStatements = Array.from(bean.dependencies).map(dependency => {
        const dependencyValue = getDependencyValueExpression(dependency);

        return factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createIdentifier(dependency.parameterName),
                    undefined,
                    dependency.node.type,
                    dependencyValue
                )],
                ts.NodeFlags.Const
            )
        );
    });

    return compact(dependenciesStatements);
};
