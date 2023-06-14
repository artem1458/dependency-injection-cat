import { ClassPropertyWithCallExpressionInitializer } from '../ts/types';
import { getPropertyBeanInfo } from '../ts/bean-info/getPropertyBeanInfo';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DITypeBuilder } from '../type-system/DITypeBuilder';
import { ContextBean } from './ContextBean';
import { BeanKind } from './BeanKind';
import { Context } from '../context/Context';

export const registerPropertyBean = (
    compilationContext: CompilationContext,
    context: Context,
    classElement: ClassPropertyWithCallExpressionInitializer,
): void => {
    const beanInfo = getPropertyBeanInfo(compilationContext, context, classElement);

    const typeChecker = compilationContext.typeChecker;
    const type = typeChecker.getTypeAtLocation(classElement);
    const diType = DITypeBuilder.build(type, compilationContext);

    const contextBean = new ContextBean({
        context: context,
        classMemberName: classElement.name.getText(),
        diType: diType,
        node: classElement,
        kind: BeanKind.PROPERTY,
        scope: beanInfo.scope,
    });
    context.registerBean(contextBean);
};
