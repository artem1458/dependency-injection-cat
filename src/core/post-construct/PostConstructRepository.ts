import { IContextDescriptor } from '../context/ContextRepository';
import { IBeanDescriptor } from '../bean/BeanRepository';

interface IPostConstructDescriptor {
    classMemberName: string;
    dependencies: Set<IBeanDescriptor>;
}

export class PostConstructRepository {
    static contextDescriptorToPostConstructDescriptors = new Map<IContextDescriptor, Set<IPostConstructDescriptor>>();

    static register(contextDescriptor: IContextDescriptor, postConstructDescriptor: IPostConstructDescriptor): void {
        let existSet = this.contextDescriptorToPostConstructDescriptors.get(contextDescriptor);

        if (!existSet) {
            existSet = new Set<IPostConstructDescriptor>();

            this.contextDescriptorToPostConstructDescriptors.set(contextDescriptor, existSet);
        }

        existSet.add(postConstructDescriptor);
    }

    static clearBeanInfoByContextDescriptor(contextDescriptor: IContextDescriptor): void {
        this.contextDescriptorToPostConstructDescriptors.delete(contextDescriptor);
    }
}
