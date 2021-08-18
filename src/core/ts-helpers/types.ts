import ts, { CallExpression, PropertyDeclaration } from 'typescript';

export interface NamedClassDeclaration extends ts.ClassDeclaration {
    name: ts.Identifier;
}

export interface ClassPropertyDeclarationWithInitializer extends PropertyDeclaration {
    initializer: CallExpression;
}

export interface ClassPropertyArrowFunction extends PropertyDeclaration {
    initializer: ts.ArrowFunction;
}

export interface ClassPropertyDeclarationWithExpressionInitializer extends PropertyDeclaration {
    initializer: ts.Expression;
}
