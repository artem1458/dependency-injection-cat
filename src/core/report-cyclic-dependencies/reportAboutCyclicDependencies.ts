import { DependencyGraph } from '../connect-dependencies/DependencyGraph';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';

export const reportAboutCyclicDependencies = (contextDescriptor: IContextDescriptor) => {
    const cycle = DependencyGraph.getCycle();

    cycle.forEach((cycles, contextName) => {
        if (contextDescriptor.name !== contextName) {
            return;
        }

        cycles.forEach(cycle => {
            const names: string[] = [];
            const nodes: ts.Node[] = [];

            cycle.forEach(it => {
                names.push(it.classMemberName);
                nodes.push(it.node);
            });

            CompilationContext.reportErrorWithMultipleNodes({
                nodes,
                message: `Cyclic dependencies detected in context "${contextName}" for Beans: ${names.join(' <—> ')}`,
            });
        });
    });
};
