import { BeanRepository } from '../bean/BeanRepository';
import { BeanDependenciesRepository } from '../bean-dependencies/BeanDependenciesRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DependencyGraph } from './DependencyGraph';

export const buildDependencyGraphAndFillQualifiedBeans = () => {
    BeanRepository.beanDescriptorRepository.forEach((beansMap, contextName) => {
        const beanDependenciesMap = BeanDependenciesRepository.getBeanDescriptorMapByContextName(contextName);

        if (beanDependenciesMap === null) {
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
                        const assumedBean = beanCandidates.find(it => it.classMemberName === dependencyDescriptor.qualifier) ?? null;

                        if (assumedBean === null) {
                            CompilationContext.reportError({
                                node: dependencyDescriptor.node,
                                message: `Bean with qualifier "${dependencyDescriptor.qualifier}" and type "${dependencyDescriptor.originalTypeName}" not found`,
                            });
                            return;
                        }

                        dependencyDescriptor.qualifiedBean = assumedBean;
                        DependencyGraph.addNodeWithEdges(beanDescriptor, assumedBean);
                        return;
                    }

                    if (beanCandidates.length > 1) {
                        CompilationContext.reportErrorWithMultipleNodes({
                            nodes: [
                                dependencyDescriptor.node,
                                ...beanCandidates.map(it => it.node),
                            ],
                            message: `Found ${beanCandidates.length} Bean candidates, please use @Qualifier to specify which Bean should be injected`,
                        });
                        return;
                    }
                    dependencyDescriptor.qualifiedBean = beanCandidates[0];
                    DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidates[0]);
                });
            });
        });
    });
};
