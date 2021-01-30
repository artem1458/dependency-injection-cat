import { BeanRepository } from '../bean/BeanRepository';
import { BeanDependenciesRepository } from '../bean-dependencies/BeanDependenciesRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DependencyGraph } from './DependencyGraph';

export const buildDependencyGraph = () => {
    BeanRepository.beanDescriptorRepository.forEach((beansMap, contextName) => {
        const beanDependenciesMap = BeanDependenciesRepository.getBeanDescriptorMapByContextName(contextName);

        if (beanDependenciesMap === null) {
            CompilationContext.reportErrorMessage(`No bean dependencies registered for the context ${contextName}`);
            return;
        }

        beansMap.forEach((beanDescriptors, beanType) => {
            beanDescriptors.forEach(beanDescriptor => {
                const dependencies = beanDependenciesMap.get(beanDescriptor) ?? null;

                if (dependencies === null || dependencies.length === 0) {
                    return;
                }

                dependencies.forEach(dependencyDescriptor => {
                    const beanCandidates = beansMap.get(dependencyDescriptor.type) ?? null;

                    if (beanCandidates === null || beanCandidates.length === 0) {
                        CompilationContext.reportError({
                            node: dependencyDescriptor.node,
                            message: 'Bean for this dependency is not registered',
                        });
                        return;
                    }

                    if (dependencyDescriptor.qualifier !== null) {
                        const assumedBean = beanCandidates.find(it => it.qualifier === dependencyDescriptor.qualifier) ?? null;

                        if (assumedBean === null) {
                            CompilationContext.reportError({
                                node: dependencyDescriptor.node,
                                message: `Bean with qualifier ${dependencyDescriptor.qualifier} not found`,
                            });
                            return;
                        }

                        DependencyGraph.graph.addEdges(beanDescriptor, assumedBean);
                        return;
                    }

                    if (beanCandidates.length > 1) {
                        CompilationContext.reportError({
                            node: dependencyDescriptor.node,
                            message: `Found ${beanCandidates.length} Bean candidates, please use @Qualifier to specify which Bean should be injected`,
                        });
                        return;
                    }
                    DependencyGraph.graph.addEdges(beanDescriptor, beanCandidates[0]);
                });
            });
        });
    });
};
