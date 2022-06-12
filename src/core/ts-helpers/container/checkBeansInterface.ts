import { IContainerAccessNode } from './isContainerAccess';
import ts from 'typescript';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';
import { ContextRepository, IContextDescriptor } from '../../context/ContextRepository';

export const checkBeansInterface = (node: IContainerAccessNode, contextDescriptor: IContextDescriptor) => {
    if (node.expression.name.getText() === 'clearContext') {
        return;
    }

    if (!node.typeArguments || node.typeArguments.length === 0) {
        // CompilationContext.reportError({
        //     node,
        //     message: 'Container access should have a required TBeans type argument',
        //     filePath: node.getSourceFile().fileName,
        // });
        return;
    }

    const beansType = node.typeArguments[0];

    if (!beansType || !ts.isTypeReferenceNode(beansType)) {
        // CompilationContext.reportError({
        //     node: beansType,
        //     message: 'TBeans should be a plain interface reference',
        //     filePath: node.getSourceFile().fileName,
        // });
        return;
    }

    const nodeDescriptor = getNodeSourceDescriptorDeep(
        node.getSourceFile(),
        beansType.typeName.getText(),
    );

    if (nodeDescriptor === null || nodeDescriptor.node === null) {
        // CompilationContext.reportError({
        //     node: beansType.typeName,
        //     message: 'Can\'t qualify TBeans declaration',
        //     filePath: node.getSourceFile().fileName,
        // });
        return;
    }

    const contextBeansInterfaceNodeSourceDescriptor = ContextRepository.contextNameToTBeanNodeSourceDescriptor
        .get(contextDescriptor.name)?.nodeSourceDescriptor ?? null;

    if (contextBeansInterfaceNodeSourceDescriptor === null || contextBeansInterfaceNodeSourceDescriptor.node === null) {
        return;
    }

    if (nodeDescriptor.name !== contextBeansInterfaceNodeSourceDescriptor.name || nodeDescriptor.path !== contextBeansInterfaceNodeSourceDescriptor.path) {
        // CompilationContext.reportErrorWithMultipleNodes({
        //     nodes: [
        //         contextBeansInterfaceNodeSourceDescriptor.node,
        //         nodeDescriptor.node,
        //     ],
        //     message: `TBeans interface should be the same as on ${contextDescriptor.name}\nExpected\nFound`,
        //     filePath: node.getSourceFile().fileName,
        // });
    }
};
