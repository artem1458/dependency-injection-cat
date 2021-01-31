import { DependencyGraph } from '../connect-dependencies/DependencyGraph';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import ts from 'typescript';

export const reportAboutCyclicDependencies = () => {
    const cycle = DependencyGraph.getCycle();

    cycle.forEach((cycles, contextName) => {
        cycles.forEach(cycle => {
            const names: string[] = [];
            const nodes: ts.Node[] = [];

            cycle.forEach(it => {
                names.push(it.classMemberName);
                nodes.push(it.node);
            });

            CompilationContext.reportErrorWithMultipleNodes({
                nodes: nodes,
                message: `Cyclic dependencies detected in context "${contextName}" for Beans: ${names.join(' <—> ')}`,
            });
        });
    });
};
