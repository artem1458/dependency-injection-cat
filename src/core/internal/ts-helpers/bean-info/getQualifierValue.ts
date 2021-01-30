import * as ts from 'typescript';
import { removeQuotesFromString } from '../../../../utils/removeQuotesFromString';
import { CompilationContext } from '../../../compilation-context/CompilationContext';

//TODO Maybe remove
export function getQualifierValue(expression: ts.ObjectLiteralExpression): string | null {
    const qualifierNode = expression.properties.find(it => it.name?.getText() === 'qualifier');
    if (qualifierNode === undefined) {
        return null;
    }

    let qualifierValue: string | null = null;

    if (ts.isPropertyAssignment(qualifierNode)) {
        if (!ts.isStringLiteral(qualifierNode.initializer)) {
            CompilationContext.reportError({
                message: 'Bean qualifier should be a string literal',
                node: expression,
            });
        }

        qualifierValue = removeQuotesFromString(qualifierNode.initializer.getText());
    }

    if (qualifierValue === '') {
        CompilationContext.reportError({
            message: 'Qualifier should not be empty string',
            node: qualifierNode,
        });
    }

    return qualifierValue;
}
