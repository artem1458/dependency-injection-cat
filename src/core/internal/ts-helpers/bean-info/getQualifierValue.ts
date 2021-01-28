import * as ts from 'typescript';
import { getClassMemberLocationMessage } from '../getClassMemberLocationMessage';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';

export function getQualifierValue(expression: ts.ObjectLiteralExpression, method: ts.MethodDeclaration): string | undefined {
    const qualifierNode = expression.properties.find(it => it.name?.getText() === 'qualifier');
    if (qualifierNode === undefined) {
        return undefined;
    }

    let qualifierValue: string | undefined = undefined;

    if (ts.isPropertyAssignment(qualifierNode)) {
        if (!ts.isStringLiteral(qualifierNode.initializer)) {
            throw new Error('Qualifier in bean should be a string literal' + getClassMemberLocationMessage(method));
        }

        qualifierValue = removeQuotesFromString(qualifierNode.initializer.getText());
    }

    return qualifierValue;
}
