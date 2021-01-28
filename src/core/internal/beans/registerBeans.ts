import * as ts from 'typescript';
import { ContextRepository, IContextDescriptor } from '../context/ContextRepository';
import { isMethodBean } from '../../../typescript-helpers/decorator-helpers/isMethodBean';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getPositionOfNode } from '../utils/getPositionOfNode';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { BeansRepository } from './BeansRepository';

export const registerBeans = () => {
    ContextRepository.repository.forEach((contextDescriptor, contextDeclaration) => {
        contextDeclaration.members.forEach((classElement) => {
            if (isMethodBean(classElement)) {
                registerMethodBean(contextDescriptor, classElement);
            }
        });
    });
};

function registerMethodBean(contextDescriptor: IContextDescriptor, classElement: ts.MethodDeclaration): void {
    if (!classElement.type) {
        CompilationContext.reportError({
            nodePosition: getPositionOfNode(classElement),
            path: classElement.getSourceFile().fileName,
            errorMessage: 'Beans should have a type',
        });

        return;
    }

    const { typeId, originalTypeName } = typeQualifier(classElement.type);

    BeansRepository.registerMethodBean(
        contextDescriptor.name,
        qualifierName,
        contextName,
        typeId,
        originalTypeName,
        scope,
        node,
    );

}
