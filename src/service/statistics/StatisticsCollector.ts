import { IProcessFilesStatistics } from '../types/process-files/IProcessFilesResponse';
import { AbstractStatistics } from './AbstractStatistics';
import { BeanRepository, IBeanDescriptor } from '../../core/bean/BeanRepository';
import {
    BeanDependenciesRepository,
    IBeanDependencyDescriptor
} from '../../core/bean-dependencies/BeanDependenciesRepository';
import {
    ILifecycleDependencyDescriptor,
    LifecycleMethodsRepository
} from '../../core/context-lifecycle/LifecycleMethodsRepository';
import { BeanDeclarationLinkStatistics } from './link/BeanDeclarationLinkStatistics';
import { QualifiedBeanDeclarationLinkStatistics } from './link/QualifiedBeanDeclarationLinkStatistics';
import { BeanUsageLinkStatistics } from './link/BeanUsageLinkStatistics';
import { ContextRepository } from '../../core/context/ContextRepository';
import { ContextImplementationLinkStatistics } from './link/ContextImplementationLinkStatistics';
import { ContextDetailsStatistics } from './ContextDetailsStatistics';

export class StatisticsCollector {

    invoke(affectedFiles: Set<string>): IProcessFilesStatistics[] {
        const result: AbstractStatistics[] = [];
        const beanDescriptorToDependents = new Map<IBeanDescriptor, Set<IBeanDependencyDescriptor | ILifecycleDependencyDescriptor>>();

        ContextRepository.contextDescriptorToContextInterface.forEach((contestInterfaceDescriptor, contextDescriptor) => {
            const contextImplementationLinkStatistics = ContextImplementationLinkStatistics.build(contestInterfaceDescriptor);

            contextImplementationLinkStatistics.forEach(it => {
                result.push(it);
                affectedFiles.add(it.fromPosition.path);
                affectedFiles.add(it.toPosition.path);
            });

            result.push(new ContextDetailsStatistics(contextDescriptor));
        });

        Array.from(BeanRepository.contextIdToBeanDescriptorsMap.values()).forEach(beanDescriptorsByContext => {
            beanDescriptorsByContext.forEach(beanDescriptor => {
                const statistics = BeanDeclarationLinkStatistics.build(beanDescriptor);

                statistics.forEach(it => {
                    result.push(it);
                    affectedFiles.add(it.fromPosition.path);
                    affectedFiles.add(it.toPosition.path);
                });
            });
        });

        Array.from(LifecycleMethodsRepository.contextDescriptorToLifecycleDescriptors.values())
            .forEach(lifecycleDescriptors => {
                lifecycleDescriptors.forEach(lifecycleDescriptor => {
                    lifecycleDescriptor.dependencies.forEach(dependencyDescriptor => {
                        dependencyDescriptor.qualifiedBeans.forEach(beanDescriptor => {
                            const dependents = beanDescriptorToDependents.get(beanDescriptor) ?? new Set();

                            dependents.add(dependencyDescriptor);

                            beanDescriptorToDependents.set(beanDescriptor, dependents);
                        });

                        QualifiedBeanDeclarationLinkStatistics.build(dependencyDescriptor)
                            .forEach(it => {
                                result.push(it);
                                affectedFiles.add(it.fromPosition.path);
                                affectedFiles.add(it.toPosition.path);
                            });
                    });
                });
            });


        BeanDependenciesRepository.data.forEach(beanDescriptorToDependencies => {
            beanDescriptorToDependencies.forEach((dependencies, descriptor) => {

                dependencies.forEach(dependencyDescriptor => {

                    dependencyDescriptor.qualifiedBeans.forEach(qualifiedBeanDescriptor => {
                        const dependents = beanDescriptorToDependents.get(qualifiedBeanDescriptor) ?? new Set();

                        dependents.add(dependencyDescriptor);

                        beanDescriptorToDependents.set(qualifiedBeanDescriptor, dependents);
                    });

                    QualifiedBeanDeclarationLinkStatistics.build(dependencyDescriptor)
                        .forEach(it => {
                            result.push(it);
                            affectedFiles.add(it.fromPosition.path);
                            affectedFiles.add(it.toPosition.path);
                        });
                });
            });
        });

        beanDescriptorToDependents.forEach((dependents, beanDescriptor) => {
            BeanUsageLinkStatistics.build(beanDescriptor, Array.from(dependents))
                .forEach(it => {
                    result.push(it);
                    affectedFiles.add(it.fromPosition.path);
                    affectedFiles.add(it.toPosition.path);
                });
        });

        return result.map(it => ({
            type: it.type,
            payload: JSON.stringify(it),
        }));
    }
}
