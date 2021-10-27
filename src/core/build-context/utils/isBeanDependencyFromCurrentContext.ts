import { IBeanDescriptor } from '../../bean/BeanRepository';

export const isBeanDependencyFromCurrentContext = (bean: IBeanDescriptor, beanDependency: IBeanDescriptor): boolean =>
    bean.contextDescriptor.id === beanDependency.contextDescriptor.id;
