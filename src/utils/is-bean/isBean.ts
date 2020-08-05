import { MethodDeclaration, Node, isMethodDeclaration } from 'typescript'

export function isBean(node: Node): node is MethodDeclaration {
    return isMethodDeclaration(node);
}
