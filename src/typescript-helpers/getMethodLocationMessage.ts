import { MethodDeclaration } from 'typescript';

export function getMethodLocationMessage(node: MethodDeclaration): string {
    const path = node.getSourceFile().fileName;
    const methodName = node.name.getText();
    return `, Method Name = ${methodName}, Path = ${path}`;
}
