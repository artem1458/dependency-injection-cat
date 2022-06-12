import { DependencyGraph } from '../connect-dependencies/DependencyGraph';
import { IContextDescriptor } from '../context/ContextRepository';
import { CompilationContext } from '../../build-context/CompilationContext';
import { CyclicDependenciesError } from '../../exceptions/compilation/errors/CyclicDependenciesError';

export const reportAboutCyclicDependencies = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor
) => {
    const cycle = DependencyGraph.getCycle();

    cycle.forEach((cycles, contextName) => {
        if (contextDescriptor.name !== contextName) {
            return;
        }

        cycles.forEach(cycle => {
            cycle.forEach(item => {
                const otherDependencyNames = cycle.filter(it => it !== item).map(it => it.classMemberName);
                compilationContext.report(new CyclicDependenciesError(
                    `${item.classMemberName} <—> ${otherDependencyNames.join(' <—> ')}`,
                    item.node,
                    contextDescriptor.node,
                ));
            });
        });
    });
};
